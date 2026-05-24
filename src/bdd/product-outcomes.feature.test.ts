import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import { OUTCOMES_SIGNAL } from '../data/sensorData';
import type { Triad } from '../domain/sensors';
import { metricTrend, metricRunTrend } from '../components/common/trend';

const O = OUTCOMES_SIGNAL.value;

// Which pole the triad leans toward in a period (mean barycentric weight) — the same
// reading the cockpit shows.
function leanIndex(t: Triad, period: 'current' | 'prior'): number {
  const r = t.stories.filter((s) => s.period === period);
  const m = r.reduce((o, s) => ({ a: o.a + s.a, b: o.b + s.b, c: o.c + s.c }), { a: 0, b: 0, c: 0 });
  return [m.a, m.b, m.c].indexOf(Math.max(m.a, m.b, m.c));
}

const feature = await loadFeature('src/bdd/product-outcomes.feature');

describeFeature(feature, ({ ScenarioOutline, Scenario }) => {
  ScenarioOutline('the AARRR funnel covers every PIRATE stage', ({ Given, Then }, variables) => {
    Given('the product outcomes', () => {
      expect(O.aarrr).toHaveLength(5);
    });
    Then('the AARRR lens includes a "<stage>" metric', () => {
      expect(O.aarrr.some((m) => m.label.includes(variables.stage))).toBe(true);
    });
  });

  ScenarioOutline('the HEART lens covers every experience quality', ({ Given, Then }, variables) => {
    Given('the product outcomes', () => {
      expect(O.heart).toHaveLength(5);
    });
    Then('the HEART lens includes a "<quality>" metric', () => {
      expect(O.heart.some((m) => m.label.includes(variables.quality))).toBe(true);
    });
  });

  Scenario('every metric leads with direction of travel, not a target', ({ Given, Then, And }) => {
    const metrics = [...O.aarrr, ...O.heart];
    Given('the product outcomes', () => {
      expect(metrics).toHaveLength(10);
    });
    Then('every metric has a current and prior value so a trend is computable', () => {
      for (const m of metrics) {
        expect(typeof m.value).toBe('number');
        expect(typeof m.prior).toBe('number');
      }
    });
    And('no metric declares a target or threshold', () => {
      for (const m of metrics) {
        expect('target' in m).toBe(false);
        expect('goal' in m).toBe(false);
        expect('tolerable' in m).toBe(false);
      }
    });
  });

  Scenario('customer sense-making is a Cynefin triad that has drifted', ({ Given, Then, And }) => {
    const t = O.customerTriad;
    Given('the product outcomes', () => {
      expect(t.stories.length).toBeGreaterThan(0);
    });
    Then('the customer triad has three positive poles', () => {
      expect(t.poles).toHaveLength(3);
    });
    And('it currently leans toward "Removed friction"', () => {
      expect(t.poles[leanIndex(t, 'current')].label).toBe('Removed friction');
    });
    And('it has drifted from "Sparked delight"', () => {
      expect(t.poles[leanIndex(t, 'prior')].label).toBe('Sparked delight');
    });
  });

  Scenario('unserved jobs are customer jobs-to-be-done', ({ Given, Then, And }) => {
    const jobs = O.jobs;
    Given('the product outcomes', () => {
      expect(jobs.length).toBeGreaterThan(0);
    });
    Then('each is phrased as a customer job-to-be-done', () => {
      for (const j of jobs) expect(j.job).toMatch(/^When\b.*\bI want\b.*\bso I can\b/i);
    });
    And('each carries evidence', () => {
      for (const j of jobs) expect(j.evidence.trim().length).toBeGreaterThan(0);
    });
    And('they are uniquely ranked', () => {
      const ranks = jobs.map((j) => j.rank);
      expect(new Set(ranks).size).toBe(jobs.length);
    });
  });

  Scenario('metrics carry a multi-point series so the signal resists last-point tampering', ({ Given, Then, And }) => {
    const metrics = [...O.aarrr, ...O.heart];
    Given('the product outcomes', () => {
      expect(metrics).toHaveLength(10);
    });
    Then('every metric has a series of at least three points', () => {
      for (const m of metrics) expect(m.series.length).toBeGreaterThanOrEqual(3);
    });
    And('each series ends with the prior then the current value', () => {
      for (const m of metrics) {
        expect(m.series[m.series.length - 1]).toBe(m.value);
        expect(m.series[m.series.length - 2]).toBe(m.prior);
      }
    });
    And("at least one metric's signal trend disagrees with its last-point delta", () => {
      const disagrees = metrics.some(
        (m) => metricRunTrend(m).direction !== metricTrend(m).direction,
      );
      expect(disagrees).toBe(true);
    });
  });

  Scenario('the engagement signal warns against celebrating the latest bar', ({ Given, Then, And }) => {
    const eng = O.heart.find((m) => m.key === 'eng');
    Given('the product outcomes', () => {
      expect(eng).toBeTruthy();
    });
    Then('the engagement signal trend is down', () => {
      expect(metricRunTrend(eng!).direction).toBe('down');
    });
    And('its last-point delta is up', () => {
      expect(metricTrend(eng!).direction).toBe('up');
    });
  });
});
