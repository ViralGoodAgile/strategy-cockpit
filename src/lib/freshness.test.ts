import { describe, it, expect } from 'vitest';
import { ageInDays, freshnessOf, worstFreshness, WEEKLY_CADENCE } from './freshness';

const now = new Date('2026-05-24T00:00:00Z');
const daysAgo = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

describe('freshness', () => {
  it('ageInDays counts whole days', () => {
    expect(ageInDays(daysAgo(0), now)).toBe(0);
    expect(ageInDays(daysAgo(5), now)).toBe(5);
  });

  it('derives freshness from cadence', () => {
    expect(freshnessOf(daysAgo(3), WEEKLY_CADENCE, now)).toBe('fresh');
    expect(freshnessOf(daysAgo(10), WEEKLY_CADENCE, now)).toBe('aging');
    expect(freshnessOf(daysAgo(30), WEEKLY_CADENCE, now)).toBe('stale');
    expect(freshnessOf(daysAgo(90), WEEKLY_CADENCE, now)).toBe('dead');
  });

  it('worstFreshness picks the least trustworthy', () => {
    expect(worstFreshness(['fresh', 'aging', 'stale'])).toBe('stale');
    expect(worstFreshness(['fresh', 'fresh'])).toBe('fresh');
    expect(worstFreshness(['aging', 'dead'])).toBe('dead');
  });
});
