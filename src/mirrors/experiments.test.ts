import { describe, it, expect } from 'vitest';
import { allExperiments, experimentTally } from './experiments';
import { GOAL_TREE } from '../data/goals';

describe('experiment ledger', () => {
  it('flattens every experiment across the ladder', () => {
    const xs = allExperiments(GOAL_TREE);
    expect(xs.length).toBe(GOAL_TREE.intermediates.reduce((n, g) => n + g.experiments.length, 0));
    expect(xs.length).toBeGreaterThan(0);
  });

  it('tallies outcomes by status, summing to the total', () => {
    const t = experimentTally(GOAL_TREE);
    expect(t.validated + t.invalidated + t.unsure).toBe(t.total);
  });

  it('the seed ladder exercises all three outcomes (validated, invalidated, unsure)', () => {
    const t = experimentTally(GOAL_TREE);
    expect(t.validated).toBeGreaterThan(0);
    expect(t.invalidated).toBeGreaterThan(0);
    expect(t.unsure).toBeGreaterThan(0);
  });

  it('every experiment names a measure and a hypothesis (outcome over output)', () => {
    for (const x of allExperiments(GOAL_TREE)) {
      expect(x.measure.length).toBeGreaterThan(0);
      expect(x.hypothesis.toLowerCase()).toContain('we believe');
    }
  });
});
