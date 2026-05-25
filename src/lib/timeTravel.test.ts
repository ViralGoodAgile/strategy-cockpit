import { describe, it, expect } from 'vitest';
import { clampFrame, frameForPeriod, periodLabel, unitLabel } from './timeTravel';

describe('time-travel frame logic', () => {
  it('clamps a scrub position into range', () => {
    expect(clampFrame(-2, 5)).toBe(0);
    expect(clampFrame(9, 5)).toBe(5);
    expect(clampFrame(3, 5)).toBe(3);
  });

  it('labels a period in the chosen granularity', () => {
    expect(periodLabel(0, 'weeks')).toBe('now');
    expect(periodLabel(3, 'weeks')).toBe('3 wks ago');
    expect(periodLabel(1, 'weeks')).toBe('1 wk ago');
    expect(periodLabel(3, 'months')).toBe('3 mo ago');
    expect(periodLabel(2, 'quarters')).toBe('2 qtrs ago');
    expect(periodLabel(1, 'halves')).toBe('1 half ago');
    expect(periodLabel(2, 'halves')).toBe('2 halves ago');
    expect(periodLabel(4, 'years')).toBe('4 yrs ago');
  });

  it('projects a global period onto a flow frame (one master clock)', () => {
    // 6 periods (last index 5) onto 8 frames (last index 7)
    expect(frameForPeriod(5, 5, 8)).toBe(7); // now → latest frame
    expect(frameForPeriod(0, 5, 8)).toBe(0); // oldest → first frame
    expect(frameForPeriod(3, 5, 8)).toBe(4); // round(0.6 * 7)
    // monotonic: travelling forward never steps the frame backward
    const frames = [0, 1, 2, 3, 4, 5].map((p) => frameForPeriod(p, 5, 8));
    for (let i = 1; i < frames.length; i++) expect(frames[i]).toBeGreaterThanOrEqual(frames[i - 1]);
    // degenerate inputs are safe
    expect(frameForPeriod(3, 5, 1)).toBe(0); // a single frame
    expect(frameForPeriod(3, 0, 8)).toBe(7); // no timeline → "now"
  });

  it('names each granularity for the picker', () => {
    expect(unitLabel('weeks')).toBe('weeks');
    expect(unitLabel('halves')).toBe('half-years');
    expect(unitLabel('quarters')).toBe('quarters');
  });
});
