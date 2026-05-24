import { describe, it, expect } from 'vitest';
import type { Freshness } from '../domain/types';
import { hygieneRows, hygieneSummary } from './hygiene';

const RANK: Record<Freshness, number> = { fresh: 0, aging: 1, stale: 2, dead: 3 };

describe('data hygiene ledger', () => {
  it('lists every signal, worst-first', () => {
    const rows = hygieneRows();
    expect(rows.length).toBe(9);
    for (let i = 1; i < rows.length; i++) {
      expect(RANK[rows[i - 1].freshness]).toBeGreaterThanOrEqual(RANK[rows[i].freshness]);
    }
  });

  it('summarises fresh vs present-but-stale', () => {
    const rows = hygieneRows();
    const s = hygieneSummary(rows);
    expect(s.total).toBe(9);
    expect(s.presentButStale).toBe(s.total - s.fresh);
    expect(s.fresh).toBeGreaterThan(0);
  });
});
