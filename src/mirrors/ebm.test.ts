import { describe, it, expect } from 'vitest';
import { KVA_ORDER, metricDirection, valueAreas } from './ebm';
import type { Metric } from '../domain/sensors';

const metric = (from: number, to: number, better: 'higher' | 'lower'): Metric => ({
  key: 'k',
  label: 'm',
  display: String(to),
  value: to,
  prior: from,
  unit: '',
  better,
  series: [from, to],
});

const sample = () =>
  valueAreas({
    currentValue: [metric(100, 140, 'higher')],
    timeToMarket: [metric(60, 40, 'lower')],
    throughput: [5, 9],
    unservedJobs: 3,
    weakSignals: 4,
    mandateMedianGap: 1,
  });

describe('ebm value areas', () => {
  it('represents all four Key Value Areas, in order', () => {
    expect(sample().map((a) => a.id)).toEqual(KVA_ORDER);
  });

  it('reads each metric as a direction of travel, never a target', () => {
    expect(metricDirection(metric(100, 140, 'higher'))).toBe('improving');
    expect(metricDirection(metric(140, 100, 'higher'))).toBe('worsening');
    expect(metricDirection(metric(60, 40, 'lower'))).toBe('improving');
    expect(metricDirection(metric(40, 60, 'lower'))).toBe('worsening');
    expect(metricDirection(metric(50, 50, 'higher'))).toBe('flat');
  });

  it('reads Unrealized Value as the open-jobs gap', () => {
    const uv = sample().find((a) => a.id === 'UV')!;
    expect(uv.measures[0].label).toMatch(/unserved/i);
    expect(uv.measures[0].detail).toContain('3');
  });

  it('flags a wide mandate gap as worsening the ability to innovate', () => {
    const a2i = valueAreas({
      currentValue: [],
      timeToMarket: [],
      throughput: [5, 5],
      unservedJobs: 0,
      weakSignals: 0,
      mandateMedianGap: 3,
    }).find((a) => a.id === 'A2I')!;
    const gap = a2i.measures.find((m) => /mandate/i.test(m.label))!;
    expect(gap.direction).toBe('worsening');
  });

  it('carries only outcomes, never output counts', () => {
    const labels = sample().flatMap((a) => a.measures.map((m) => m.label.toLowerCase()));
    expect(labels.some((l) => /story points|stories shipped|velocity/.test(l))).toBe(false);
  });
});
