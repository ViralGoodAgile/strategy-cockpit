import { describe, it, expect } from 'vitest';
import type { Metric } from '../../domain/sensors';
import { metricAt, metricTrend, metricRunTrend } from './trend';

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

describe('metricAt — a metric read as of an earlier period', () => {
  const m = metric({
    value: 2.3,
    prior: 1.8,
    unit: '/day',
    display: '2.3 / day',
    series: [1.5, 1.7, 1.6, 1.9, 1.8, 2.3],
  });

  it('reformats the value at the chosen period, keeping the display suffix', () => {
    const a = metricAt(m, 0);
    expect(a.value).toBe(1.5);
    expect(a.display).toBe('1.5 / day');
  });

  it('points its arrows at the series up to that period', () => {
    const a = metricAt(m, 2);
    expect(a.series).toEqual([1.5, 1.7, 1.6]);
    expect(a.prior).toBe(1.7); // the point before the as-of
  });

  it('returns the metric untouched at the latest period (keeps the authored display)', () => {
    expect(metricAt(m, 5)).toBe(m);
  });

  it('matches the value precision and percent suffix', () => {
    const pct = metric({ value: 99.94, unit: '%', display: '99.94 %', series: [99.85, 99.9, 99.94] });
    expect(metricAt(pct, 0).display).toBe('99.85 %');
  });
});
