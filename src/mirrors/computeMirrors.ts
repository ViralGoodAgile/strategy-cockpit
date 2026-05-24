import type {
  MirrorVerdict,
  PlanguageEntry,
  Strategy,
  StrategyVersion,
  Trend,
} from '../domain/types';
import { ageInDays, freshnessOf, STRATEGY_CADENCE } from '../lib/freshness';

// Word count of a prose field.
function words(s: string): number {
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}

// A Planguage entry is "full" only with all four fields (Scale+Meter+Tolerable+Goal).
function isFull(e: PlanguageEntry): boolean {
  return !!(e.scale.trim() && e.meter.trim() && e.tolerable.trim() && e.goal.trim());
}

// Percent of objectives with full Planguage (0 if none authored).
function quantCoverage(entries: PlanguageEntry[]): number {
  if (entries.length === 0) return 0;
  return Math.round((entries.filter(isFull).length / entries.length) * 100);
}

// Build a numeric trend (direction first — the cockpit leads with movement, not targets).
function numTrend(now: number, before: number | undefined, unit = ''): Trend {
  if (before === undefined) return { direction: 'new', detail: 'first version' };
  if (now > before) return { direction: 'up', detail: `${before}${unit} -> ${now}${unit}` };
  if (now < before) return { direction: 'down', detail: `${before}${unit} -> ${now}${unit}` };
  return { direction: 'flat', detail: `${now}${unit}` };
}

// Compute the ten Mirror verdicts for the current draft, with trend vs the previous version.
export function computeMirrors(
  draft: Strategy,
  previous?: Strategy,
): MirrorVerdict[] {
  const v: MirrorVerdict[] = [];

  // 1. Intent.Clarity — can a stranger paraphrase it?
  {
    const w = words(draft.intent.text);
    const body =
      w === 0
        ? 'Intent is empty. A stranger has nothing to paraphrase — is that deliberate?'
        : w > 60
          ? `Intent runs to ${w} words. Could a stranger paraphrase it in one sentence?`
          : `Intent is ${w} words. The paraphrase test: hand it to a stranger — do they return your meaning?`;
    v.push({
      id: 'M-Intent.Clarity',
      quality: 'intent',
      title: 'Clarity',
      body,
      kind: w === 0 ? 'observation' : 'question',
      trend: numTrend(w, previous && words(previous.intent.text), ' words'),
    });
  }

  // 2. Context.Specificity — is a Crux named, or a platitude? (Rumelt.)
  {
    const crux = draft.context.crux.trim();
    const body = crux
      ? `Crux named: “${crux}”. Is this a diagnosis, or a restatement of the goal?`
      : 'No Crux named. Without it, Context risks being a platitude (Rumelt). What is the single biggest obstacle?';
    v.push({
      id: 'M-Context.Specificity',
      quality: 'context',
      title: 'Specificity',
      body: draft.context.cynefin ? body : `${body} Cynefin domain is also unset.`,
      kind: crux ? 'question' : 'observation',
    });
  }

  // 3. Focus.Discipline — is there an explicit "we will NOT" list?
  {
    const k = draft.focus.willNot.length;
    const cap = draft.focus.wipCap;
    const body =
      k === 0
        ? `Focus excludes nothing, and names a WIP cap of ${cap ?? '—'}. A focus that excludes nothing isn’t a focus.`
        : `Focus excludes ${k} thing(s)${cap != null ? `, WIP cap ${cap}` : ', no WIP cap'}. Are the exclusions ones you would actually turn down money for?`;
    v.push({
      id: 'M-Focus.Discipline',
      quality: 'focus',
      title: 'Discipline',
      body,
      kind: k === 0 ? 'observation' : 'question',
      trend: numTrend(k, previous && previous.focus.willNot.length),
    });
  }

  // 4. Coherence.Contradiction — naive auto-flag; human ratification needed.
  {
    const hay = [draft.intent.text, draft.decisions.text, draft.quantification.text]
      .join(' ')
      .toLowerCase();
    const hit = draft.focus.willNot.find((x) => x.trim() && hay.includes(x.toLowerCase()));
    const body = hit
      ? `Candidate contradiction: you say you will NOT do “${hit}”, yet “${hit}” appears elsewhere in the strategy. Auto-detection is shallow — does this hold up to human ratification?`
      : 'No contradictions auto-detected. Detection is shallow — read the strategy aloud: do the trade-offs actually hang together?';
    v.push({
      id: 'M-Coherence.Contradiction',
      quality: 'coherence',
      title: 'Contradiction',
      body,
      kind: hit ? 'observation' : 'question',
    });
  }

  // 5. Quantification.Reality — % with full Planguage, not just a Goal.
  {
    const total = draft.quantification.entries.length;
    const full = draft.quantification.entries.filter(isFull).length;
    const cov = quantCoverage(draft.quantification.entries);
    const body =
      total === 0
        ? 'No objectives quantified. Without Scale and Meter, "Goal" is a wish.'
        : `${full} of ${total} objectives have full Planguage (Scale + Meter + Tolerable + Goal); ${total - full} carry less.`;
    v.push({
      id: 'M-Quantification.Reality',
      quality: 'quantification',
      title: 'Reality',
      body,
      kind: 'observation',
      trend: numTrend(
        cov,
        previous && quantCoverage(previous.quantification.entries),
        '%',
      ),
    });
  }

  // 6. Decisions.Operability — usable to choose between two tickets today?
  {
    const t = draft.decisions.text.toLowerCase();
    const operable = /\b(not|don'?t|never|avoid|instead of|over)\b/.test(t) && words(t) > 0;
    const body = operable
      ? 'Decisions name do/don’t criteria. Could a developer use them today to choose between two competing tickets?'
      : 'Decisions read as aspiration, not criteria. Could a developer use this to choose between two tickets right now?';
    v.push({
      id: 'M-Decisions.Operability',
      quality: 'decisions',
      title: 'Operability',
      body,
      kind: 'question',
    });
  }

  // 7. Learning.Loops — double-loop present, or only single-loop?
  {
    const t = draft.learning.text.toLowerCase();
    const doubleLoop = /\b(assumption|belief|question|why|challenge|re-?think|wrong)\b/.test(t);
    const body =
      words(t) === 0
        ? 'No learning loops described. How will reality change your mind?'
        : doubleLoop
          ? 'Learning reaches double-loop — questioning belief, not only adjusting action. What would falsify the strategy?'
          : 'Learning describes single-loop adjustment only. Are you prepared to question the belief, not just tune the action?';
    v.push({
      id: 'M-Learning.Loops',
      quality: 'learning',
      title: 'Loops',
      body,
      kind: 'question',
    });
  }

  // 8. Emergence.Readiness — named weak-signal sources?
  {
    const w = words(draft.emergence.text);
    const body =
      w === 0
        ? 'No weak-signal sources named. Where will surprise show up first?'
        : 'An emergence posture is stated. Which single weak signal would change your next move?';
    v.push({
      id: 'M-Emergence.Readiness',
      quality: 'emergence',
      title: 'Readiness',
      body,
      kind: w === 0 ? 'observation' : 'question',
    });
  }

  // 9. Participation.Reach — who authored; whose voices are missing?
  {
    const a = draft.participation.authors.length;
    const m = draft.participation.missingVoices.length;
    const body =
      a === 0
        ? 'No authors recorded. Whose strategy is this?'
        : `Authored by ${a} voice(s); ${m} flagged as missing. Whose absence would most change this strategy?`;
    v.push({
      id: 'M-Participation.Reach',
      quality: 'participation',
      title: 'Reach',
      body,
      kind: a === 0 ? 'observation' : 'question',
      trend: numTrend(a, previous && previous.participation.authors.length),
    });
  }

  // 10. Durability.Heroism — does it depend on one named person?
  {
    const dep = draft.durability.dependsOn.trim();
    const body = dep
      ? `Strategy names “${dep}” as a dependency. What happens to it when they leave?`
      : 'No single-person dependency declared. Is it truly institutional, or just unstated heroism?';
    v.push({
      id: 'M-Durability.Heroism',
      quality: 'durability',
      title: 'Heroism',
      body,
      kind: 'question',
    });
  }

  return v;
}

// A cross-cutting freshness finding on the strategy itself (crap-in-crap-out).
export function strategyStaleness(latest: StrategyVersion | null): MirrorVerdict {
  if (!latest) {
    return {
      id: 'F-Strategy.Staleness',
      quality: null,
      title: 'Strategy freshness',
      body: 'No version saved yet. Findings below run on an unsaved draft.',
      kind: 'observation',
    };
  }
  const age = ageInDays(latest.savedAt);
  const f = freshnessOf(latest.savedAt, STRATEGY_CADENCE);
  const body =
    age <= 1
      ? `Strategy v${latest.version} saved ${age === 0 ? 'today' : 'yesterday'} — fresh.`
      : `Strategy v${latest.version} last revised ${age} days ago (${f}). Is your Context still true?`;
  return {
    id: 'F-Strategy.Staleness',
    quality: null,
    title: 'Strategy freshness',
    body,
    kind: age <= 1 ? 'observation' : 'question',
  };
}
