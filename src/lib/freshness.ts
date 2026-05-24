import type { Freshness } from '../domain/types';

// Per-signal cadence thresholds, in days: how old before a signal ages/goes stale/dies.
export interface Cadence {
  aging: number; // older than this = aging
  stale: number; // older than this = stale
  dead: number; // older than this = dead
}

// Default cadence for a roughly-weekly sensor (e.g. Mandate Levels).
export const WEEKLY_CADENCE: Cadence = { aging: 7, stale: 21, dead: 60 };

// Cadence for the strategy itself — revisions are expected far less often.
export const STRATEGY_CADENCE: Cadence = { aging: 30, stale: 90, dead: 180 };

// Whole days between an ISO timestamp and now.
export function ageInDays(observedAt: string, now: Date = new Date()): number {
  const ms = now.getTime() - new Date(observedAt).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

// Derive a freshness verdict from age + cadence. Freshness is computed, never declared.
export function freshnessOf(
  observedAt: string,
  cadence: Cadence = WEEKLY_CADENCE,
  now: Date = new Date(),
): Freshness {
  const age = ageInDays(observedAt, now);
  if (age > cadence.dead) return 'dead';
  if (age > cadence.stale) return 'stale';
  if (age > cadence.aging) return 'aging';
  return 'fresh';
}

// The worst (least trustworthy) of a set of freshness verdicts.
export function worstFreshness(list: Freshness[]): Freshness {
  const rank: Record<Freshness, number> = { fresh: 0, aging: 1, stale: 2, dead: 3 };
  return list.reduce<Freshness>(
    (worst, f) => (rank[f] > rank[worst] ? f : worst),
    'fresh',
  );
}
