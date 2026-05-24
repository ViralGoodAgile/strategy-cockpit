import type { Closure, Freshness, QualityId } from '../domain/types';

// Demo scenarios. Selecting one overrides a few computed readings so a sponsor can watch
// the cockpit react — the loop-closure return path, the headline challenge, and data
// hygiene. Baseline = the live synthetic data, unchanged.
export type ScenarioId = 'baseline' | 'closing' | 'stalled' | 'crapIn';

export interface ScenarioChallenge {
  id: string;
  title: string;
  question: string;
  trendNote?: string;
  freshness: Freshness;
  refs?: { label: string; quality?: QualityId }[];
}

export interface Scenario {
  id: ScenarioId;
  label: string;
  note: string; // one-line caption (shown as the selector tooltip)
  loop?: { state: Closure; closed: boolean; evidence: string }; // overrides Loop.Closure
  challenge?: ScenarioChallenge; // prepended as the headline challenge
  degradeHygiene?: boolean; // worsen every signal's freshness by one rank
}

export const SCENARIO_ORDER: ScenarioId[] = ['baseline', 'closing', 'stalled', 'crapIn'];

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  baseline: {
    id: 'baseline',
    label: 'Baseline',
    note: 'Live synthetic data, as authored — no overrides.',
  },
  closing: {
    id: 'closing',
    label: 'Loop closing',
    note: 'Intent was revised after reality moved — the return path is alive.',
    loop: {
      state: 'flow',
      closed: true,
      evidence:
        'Intent was revised in the latest version after a real outcome shift (activation 57% → 64%). The return path is closed — a candidate closure (temporal correlation, not yet ratified).',
    },
    challenge: {
      id: 'scn-closing',
      title: 'The loop is closing',
      question:
        'Reality moved and Intent followed — the return path is alive. What will you change now that the loop is closing, rather than treat this as done?',
      trendNote: 'first Intent revision in response to outcomes in 3 versions',
      freshness: 'fresh',
      refs: [{ label: 'Intent', quality: 'intent' }, { label: 'Learning', quality: 'learning' }],
    },
  },
  stalled: {
    id: 'stalled',
    label: 'Loop stalled',
    note: 'Reality moved but Intent has not — the loop is open.',
    loop: {
      state: 'stop',
      closed: false,
      evidence:
        'Reality has moved (retention 58% → 62%) but Intent is unchanged across the last versions. The return path is stopped — the loop is open. Revise Intent in response to close it.',
    },
    challenge: {
      id: 'scn-stalled',
      title: 'The loop is open',
      question:
        'Reality has moved, but Intent has not responded in three versions. What is stopping the strategy from adapting — no one looking, or no one allowed to change it?',
      trendNote: 'outcomes shifted while Intent held for 3 versions',
      freshness: 'fresh',
      refs: [{ label: 'Intent', quality: 'intent' }, { label: 'Decisions', quality: 'decisions' }],
    },
  },
  crapIn: {
    id: 'crapIn',
    label: 'Crap in',
    note: 'Several signals have gone stale — trust the cockpit less until they refresh.',
    loop: {
      state: 'partial',
      closed: false,
      evidence:
        'Closure cannot be verified: the outcome and triad signals are stale, so any apparent movement may be an artefact of old data. Refresh the sensors before reading the loop.',
    },
    challenge: {
      id: 'scn-crapin',
      title: 'Crap in, crap out',
      question:
        'Your freshest sources have gone stale. How much of what this cockpit shows can you actually trust right now — and which decision are you about to make on month-old data?',
      trendNote: 'data hygiene degraded across several signals',
      freshness: 'stale',
      refs: [{ label: 'Data hygiene' }],
    },
    degradeHygiene: true,
  },
};
