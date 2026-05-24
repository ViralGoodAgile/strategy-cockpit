import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import { freshnessOf, worstFreshness, WEEKLY_CADENCE } from '../lib/freshness';
import type { Freshness } from '../domain/types';

const now = new Date('2026-05-24T00:00:00Z');
const daysAgo = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const feature = await loadFeature('src/bdd/freshness.feature');

describeFeature(feature, ({ ScenarioOutline, Scenario }) => {
  ScenarioOutline('freshness from age against the weekly cadence', ({ Given, When, Then }, variables) => {
    let observedAt: string;
    let result: Freshness;
    Given('a signal observed <age> days ago', () => {
      observedAt = daysAgo(Number(variables.age));
    });
    When('its freshness is evaluated', () => {
      result = freshnessOf(observedAt, WEEKLY_CADENCE, now);
    });
    Then('it is <freshness>', () => {
      expect(result).toBe(variables.freshness);
    });
  });

  Scenario('the worst freshness wins', ({ Given, When, Then }) => {
    let verdicts: Freshness[];
    let result: Freshness;
    Given('the verdicts fresh, aging and stale', () => {
      verdicts = ['fresh', 'aging', 'stale'];
    });
    When('the worst is taken', () => {
      result = worstFreshness(verdicts);
    });
    Then('the result is stale', () => {
      expect(result).toBe('stale');
    });
  });
});
