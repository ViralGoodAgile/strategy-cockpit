import type { KvaId } from '../mirrors/ebm';

// The EBM empirical ladder: a Strategic Goal decomposes into Intermediate Goals, each pursued
// through Immediate Tactical Goals run as experiments. An experiment carries a hypothesis, the
// Key Value Area measure it intends to move, and what the evidence said — validated, invalidated
// or unsure (not yet enough signal to call). Outcomes over output: every goal names a measure.

export type ExperimentStatus = 'validated' | 'invalidated' | 'unsure';

export interface Experiment {
  id: string;
  hypothesis: string; // "We believe X will move measure Y"
  measure: string; // the KVA measure the experiment intends to move
  status: ExperimentStatus;
  evidence: string; // what the measure said after the experiment ran
}

export interface IntermediateGoal {
  id: string;
  text: string;
  experiments: Experiment[];
}

export interface StrategicGoal {
  id: string;
  text: string;
  kva: KvaId; // the value area the strategic goal is chasing
  intermediates: IntermediateGoal[];
}

// Synthetic ladder tied to the seed strategy (small product teams; activation + weekly habit).
export const GOAL_TREE: StrategicGoal = {
  id: 'sg',
  text: 'Become the default workspace for small product teams underserved by heavyweight suites.',
  kva: 'UV',
  intermediates: [
    {
      id: 'ig1',
      text: 'A new team reaches first value in the first session.',
      experiments: [
        {
          id: 'x1',
          hypothesis: 'We believe a guided first-artefact flow will cut time-to-first-value.',
          measure: 'Time-to-first-value (min)',
          status: 'validated',
          evidence: 'Median fell 18 → 8 min over three weeks; the slope holds across cohorts.',
        },
        {
          id: 'x2',
          hypothesis: 'We believe removing upfront admin config will lift activation.',
          measure: 'Activation %',
          status: 'unsure',
          evidence: 'Activation is flat so far; the sample is too small to call either way.',
        },
      ],
    },
    {
      id: 'ig2',
      text: 'Activated teams form a weekly habit.',
      experiments: [
        {
          id: 'x3',
          hypothesis: 'We believe a Monday digest will raise weekly-active teams.',
          measure: 'Weekly-active teams %',
          status: 'invalidated',
          evidence: 'No lift — opens were high but return visits did not follow. Reverted.',
        },
        {
          id: 'x4',
          hypothesis: 'We believe role-based templates will deepen adoption.',
          measure: 'Adoption (HEART)',
          status: 'validated',
          evidence: 'Adoption rose 14% → 21%; teams using a template returned more often.',
        },
      ],
    },
  ],
};
