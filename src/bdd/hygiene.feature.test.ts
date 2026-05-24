import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import type { Freshness } from '../domain/types';
import { hygieneRows, hygieneSummary } from '../lib/hygiene';

const RANK: Record<Freshness, number> = { fresh: 0, aging: 1, stale: 2, dead: 3 };

const feature = await loadFeature('src/bdd/hygiene.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('the ledger lists every signal, worst-first', ({ Given, Then, And }) => {
    const rows = hygieneRows();
    Given('the hygiene ledger', () => {
      expect(rows.length).toBeGreaterThan(0);
    });
    Then('it lists ten signals', () => {
      expect(rows.length).toBe(10);
    });
    And('they are ordered least-trustworthy first', () => {
      for (let i = 1; i < rows.length; i++) {
        expect(RANK[rows[i - 1].freshness]).toBeGreaterThanOrEqual(RANK[rows[i].freshness]);
      }
    });
    And('the present-but-stale count is the total minus the fresh count', () => {
      const s = hygieneSummary(rows);
      expect(s.presentButStale).toBe(s.total - s.fresh);
    });
  });
});
