import type { Experiment, ExperimentStatus, StrategicGoal } from '../data/goals';

// Flatten every experiment across the goal ladder (oldest hierarchy order preserved). Pure.
export function allExperiments(tree: StrategicGoal): Experiment[] {
  return tree.intermediates.flatMap((ig) => ig.experiments);
}

export interface ExperimentTally {
  validated: number;
  invalidated: number;
  unsure: number;
  total: number;
}

// Count experiments by outcome — the empirical scoreboard for the strategy's bets. Pure.
export function experimentTally(tree: StrategicGoal): ExperimentTally {
  const xs = allExperiments(tree);
  const by = (s: ExperimentStatus) => xs.filter((x) => x.status === s).length;
  return {
    validated: by('validated'),
    invalidated: by('invalidated'),
    unsure: by('unsure'),
    total: xs.length,
  };
}
