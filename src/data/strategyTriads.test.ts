import { describe, it, expect } from 'vitest';
import { STRATEGY_TRIADS } from './strategyTriads';

describe('strategy triads carry group interpretations', () => {
  it('has four triads', () => {
    expect(STRATEGY_TRIADS).toHaveLength(4);
  });

  it('each triad has at least two interpretations from distinct groups', () => {
    for (const t of STRATEGY_TRIADS) {
      expect(t.interpretations.length).toBeGreaterThanOrEqual(2);
      const groups = t.interpretations.map((i) => i.by);
      // distinct groups (various groups of people, not one voice)
      expect(new Set(groups).size).toBe(groups.length);
      for (const it of t.interpretations) {
        expect(it.by.trim().length).toBeGreaterThan(0);
        expect(it.text.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
