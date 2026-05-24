import { describe, it, expect } from 'vitest';
import type { Metric } from '../../domain/sensors';
import { metricTrend, metricRunTrend } from './trend';

// Build a Metric with sensible defaults; override only what each case needs.
function metric(p: Partial<Metric>): Metric {
  return {
    key: 'k',
    label: 'l',
    display: '',
    value: 0,
    prior: 0,
    unit: '',
    better: 'higher',
    series: [0, 0],
    ...p,
  };
}

describe('metricTrend — last-point delta (the small, secondary arrow)', () => {
  it('reads a rising last point as up, with a prior→value detail', () => {
    const t = metricTrend(metric({ value: 62, prior: 58, unit: '%' }));
    expect(t.direction).toBe('up');
    expect(t.detail).toBe('58% → 62%');
  });

  it('reads a falling last point as down — even when lower is better (e.g. MTTR)', () => {
    const t = metricTrend(metric({ value: 38, prior: 52, unit: ' min', better: 'lower' }));
    expect(t.direction).toBe('down');
    expect(t.detail).toBe('52 min → 38 min');
  });

  it('reads an unchanged last point as flat and shows the current display', () => {
    const t = metricTrend(metric({ value: 5, prior: 5, display: '5.0' }));
    expect(t.direction).toBe('flat');
    expect(t.detail).toBe('5.0');
  });
});

describe('metricRunTrend — fitted signal across the whole series (the prominent arrow)', () => {
  it('reads a rising run as up regardless of the last point', () => {
    const t = metricRunTrend(metric({ series: [10, 12, 13, 15, 17, 19] }));
    expect(t.direction).toBe('up');
    expect(t.detail).toBe('6-pt trend');
  });

  it('reads a falling run as down', () => {
    const t = metricRunTrend(metric({ series: [19, 17, 15, 13, 12, 10] }));
    expect(t.direction).toBe('down');
  });

  it('reads a noisy-but-level run as flat (no invented direction)', () => {
    const t = metricRunTrend(metric({ series: [50, 51, 49, 50, 51, 50] }));
    expect(t.direction).toBe('flat');
  });

  it('resists last-point tampering: a declining run stays down though the last point ticks up', () => {
    // The exact engagement case: long slide, latest bar pops up.
    const m = metric({ value: 0.46, prior: 0.41, series: [0.52, 0.5, 0.48, 0.44, 0.41, 0.46] });
    expect(metricTrend(m).direction).toBe('up'); // tamperable last point
    expect(metricRunTrend(m).direction).toBe('down'); // the signal still points down
  });

  it('treats a single point as new (not enough to fit a trend)', () => {
    expect(metricRunTrend(metric({ series: [7] })).direction).toBe('new');
  });
});
