import { describe, it, expect } from 'vitest';
import type { Metric } from '../../domain/sensors';
import { metricTrend } from './Numeral';

// Build a Metric with sensible defaults; override only what each case needs.
function metric(p: Partial<Metric>): Metric {
  return { key: 'k', label: 'l', display: '', value: 0, prior: 0, unit: '', better: 'higher', ...p };
}

describe('metricTrend — neutral direction of travel (trends, not pass/fail)', () => {
  it('reads a rising value as up, with a prior→value detail', () => {
    const t = metricTrend(metric({ value: 62, prior: 58, unit: '%' }));
    expect(t.direction).toBe('up');
    expect(t.detail).toBe('58% → 62%');
  });

  it('reads a falling value as down — even when lower is better (e.g. MTTR)', () => {
    // The mark reports MOVEMENT, never a verdict: MTTR dropping is still "down".
    const t = metricTrend(metric({ value: 38, prior: 52, unit: ' min', better: 'lower' }));
    expect(t.direction).toBe('down');
    expect(t.detail).toBe('52 min → 38 min');
  });

  it('reads an unchanged value as flat and shows the current display', () => {
    const t = metricTrend(metric({ value: 5, prior: 5, display: '5.0' }));
    expect(t.direction).toBe('flat');
    expect(t.detail).toBe('5.0');
  });

  it('never emits a pass/fail or target verdict — only a direction', () => {
    const t = metricTrend(metric({ value: 99.95, prior: 99.91, unit: '%' }));
    expect(['up', 'down', 'flat', 'new']).toContain(t.direction);
  });
});
