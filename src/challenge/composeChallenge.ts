import type { Challenge, Strategy } from '../domain/types';
import type { Team } from '../domain/types';
import { MANDATE_LABELS, levelGap, levelIndex } from '../domain/mandate';
import { MANDATE_SIGNAL, actualMedian } from '../data/synthetic';
import { FLOW_CONSTRAINT_SIGNAL, TRIAD_SIGNAL } from '../data/sensorData';
import { SCENARIOS } from '../data/scenarios';
import type { ScenarioId } from '../data/scenarios';

// WIP per stream across all teams.
function wipByStream(teams: Team[]) {
  const byStream: Record<string, number> = {};
  let total = 0;
  for (const t of teams) for (const w of t.work) {
    byStream[w.stream] = (byStream[w.stream] ?? 0) + 1;
    total += 1;
  }
  return { total, byStream };
}

function widening(team: Team): string | undefined {
  const h = team.history;
  if (h.length < 2) return undefined;
  const d = levelIndex(h[h.length - 1].actualMedian) - levelIndex(h[0].actualMedian);
  return d > 0 ? `and that gap has widened over the last ${h.length - 1} weeks` : undefined;
}

// Which pole a triad leans toward now (0 = first pole).
function meanLean(stories: { a: number; b: number; c: number; period: string }[]): number {
  const r = stories.filter((s) => s.period === 'current');
  const m = r.reduce((o, s) => ({ a: o.a + s.a, b: o.b + s.b, c: o.c + s.c }), { a: 0, b: 0, c: 0 });
  return [m.a, m.b, m.c].indexOf(Math.max(m.a, m.b, m.c));
}

// Compose ALL applicable cross-sensor challenges, framed against the strategy. Each
// carries the freshness of the input it rests on, so trust can be read off it.
export function composeChallenges(
  strategy: Strategy,
  scenario: ScenarioId = 'baseline',
): Challenge[] {
  const out: Challenge[] = [];
  const teams = MANDATE_SIGNAL.value;
  const mFresh = { source: 'Mandate Levels', freshness: MANDATE_SIGNAL.freshness, observedAt: MANDATE_SIGNAL.observedAt };

  // 1. Focus exclusion contradicted by work in flight (Mandate).
  const { total, byStream } = wipByStream(teams);
  const excluded = strategy.focus.willNot.map((x) => x.trim().toLowerCase()).filter(Boolean);
  let focusHit = false;
  for (const ex of excluded) {
    const stream = Object.keys(byStream).find((s) => s.toLowerCase().includes(ex) || ex.includes(s.toLowerCase()));
    if (!stream) continue;
    const pct = Math.round((byStream[stream] / total) * 100);
    const high = teams.filter((t) => t.work.some((w) => w.stream === stream) && (() => { const m = actualMedian(t); return m && levelIndex(m) >= levelIndex('F'); })());
    out.push({
      id: 'focus-mandate',
      title: 'Focus vs. the work',
      question: `Your Focus says you will NOT do “${stream}”. Yet ${pct}% of work in flight is ${stream}, and ${high.length} ${high.length === 1 ? 'team is' : 'teams are'} operating at F or above on it. What is true — the strategy, or the work?`,
      references: [
        { label: 'Focus: will-NOT list', quality: 'focus' },
        { label: `Mandate Levels: ${stream}`, teamId: high[0]?.id },
      ],
      trendNote: high[0] ? widening(high[0]) : undefined,
      ...mFresh,
    });
    focusHit = true;
    break;
  }

  // 2. Work in flight vs the strategic WIP cap (Flow).
  const frames = FLOW_CONSTRAINT_SIGNAL.value.frames;
  const f = frames[frames.length - 1];
  const inFlight = f.build.queue.length + f.build.active.length + f.review.queue.length + f.review.active.length;
  if (strategy.focus.wipCap != null && inFlight > strategy.focus.wipCap) {
    out.push({
      id: 'wip-cap',
      title: 'WIP vs. the cap',
      question: `Work in flight is ${inFlight} against a strategic WIP cap of ${strategy.focus.wipCap}. Either the cap is fiction, or focus has quietly slipped.`,
      references: [{ label: 'Focus: WIP cap', quality: 'focus' }, { label: 'Flow.Constraint' }],
      source: 'Flow.Constraint',
      freshness: FLOW_CONSTRAINT_SIGNAL.freshness,
      observedAt: FLOW_CONSTRAINT_SIGNAL.observedAt,
    });
  }

  // 3. Sense-making drift vs a Complex context (Triad).
  const sense = TRIAD_SIGNAL.value.triads[0];
  if (strategy.context.cynefin === 'complex' && meanLean(sense.stories) !== 0) {
    const lean = sense.poles[meanLean(sense.stories)].label;
    out.push({
      id: 'sense-context',
      title: 'Sensing vs. Context',
      question: `Your Context names the domain Complex — where you probe to learn. Yet sense-making leans “${lean}”, not probing. Are you analysing your way through genuinely novel ground?`,
      references: [{ label: 'Context: Cynefin', quality: 'context' }, { label: 'Cynefin triads' }],
      source: 'Cynefin triads',
      freshness: TRIAD_SIGNAL.freshness,
      observedAt: TRIAD_SIGNAL.observedAt,
    });
  }

  // 4. Fallback: the single largest authorised-vs-actual mandate gap.
  if (!focusHit) {
    let worst: { team: Team; gap: number } | null = null;
    for (const t of teams) {
      const m = actualMedian(t);
      if (!m) continue;
      const g = levelGap(t.authorised, m);
      if (!worst || Math.abs(g) > Math.abs(worst.gap)) worst = { team: t, gap: g };
    }
    if (worst) {
      const m = actualMedian(worst.team)!;
      out.push({
        id: 'mandate-gap',
        title: 'Mandate gap',
        question: `${worst.team.name} is authorised at ${worst.team.authorised} (“${MANDATE_LABELS[worst.team.authorised]}”) but its work implies ${m} (“${MANDATE_LABELS[m]}”) — a gap of ${Math.abs(worst.gap)} levels. Intended stretch, or drift?`,
        references: [{ label: 'Decisions / Focus', quality: 'decisions' }, { label: `Mandate Levels: ${worst.team.name}`, teamId: worst.team.id }],
        trendNote: widening(worst.team),
        ...mFresh,
      });
    }
  }

  // A demo scenario contributes a headline challenge, surfaced first.
  const sc = SCENARIOS[scenario].challenge;
  if (sc) {
    out.unshift({
      id: sc.id,
      title: sc.title,
      question: sc.question,
      references: sc.refs ?? [],
      source: 'scenario',
      freshness: sc.freshness,
      observedAt: new Date().toISOString(),
      trendNote: sc.trendNote,
    });
  }

  return out;
}
