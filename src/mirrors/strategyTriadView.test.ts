import { describe, it, expect } from 'vitest';
import { strategyTriadViews } from './strategyTriadView';
import { STRATEGY_TRIADS } from '../data/strategyTriads';
import { SAMPLE_STRATEGY } from '../data/sample';

describe('strategyTriadViews', () => {
  const views = strategyTriadViews(SAMPLE_STRATEGY);

  it('produces a view per strategy triad', () => {
    expect(views.length).toBe(STRATEGY_TRIADS.length);
  });

  it('each view carries three labels, three weights and its interpretations', () => {
    for (const v of views) {
      expect(v.labels).toHaveLength(3);
      expect(v.weights).toHaveLength(3);
      for (const w of v.weights) {
        expect(w).toBeGreaterThanOrEqual(0);
        expect(w).toBeLessThanOrEqual(1);
      }
      expect(v.interpretations.length).toBeGreaterThan(0);
    }
  });

  it('names the strongest and weakest quality consistent with the weights', () => {
    for (const v of views) {
      const maxI = v.weights.indexOf(Math.max(...v.weights));
      const minI = v.weights.indexOf(Math.min(...v.weights));
      expect(v.strong).toBe(v.labels[maxI]);
      expect(v.weak).toBe(v.labels[minI]);
    }
  });
});
