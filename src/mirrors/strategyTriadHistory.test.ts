import { describe, it, expect } from 'vitest';
import { leanAtPeriod, weightsAtPeriod } from './strategyTriadHistory';

describe('strategy-triad weight history', () => {
  it('returns the authored weights at the latest period', () => {
    expect(weightsAtPeriod([0.6, 0.3, 0.1], 5, 5)).toEqual([0.6, 0.3, 0.1]);
  });

  it('flattens to the mean at the earliest period', () => {
    const w = weightsAtPeriod([0.6, 0.3, 0.1], 0, 5);
    expect(w[0]).toBeCloseTo(1 / 3);
    expect(w[1]).toBeCloseTo(1 / 3);
    expect(w[2]).toBeCloseTo(1 / 3);
  });

  it('sharpens the lean monotonically toward now', () => {
    const early = weightsAtPeriod([0.6, 0.3, 0.1], 1, 5);
    const late = weightsAtPeriod([0.6, 0.3, 0.1], 4, 5);
    expect(late[0] - 1 / 3).toBeGreaterThan(early[0] - 1 / 3);
  });

  it('names the strongest and weakest quality', () => {
    expect(leanAtPeriod([0.6, 0.3, 0.1])).toEqual({ strong: 0, weak: 2 });
  });
});
