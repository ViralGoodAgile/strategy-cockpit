import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import { RELIABILITY_SIGNAL } from '../data/sensorData';
import type { Metric } from '../domain/sensors';

const feature = await loadFeature('src/bdd/reliability.feature');

describeFeature(feature, ({ ScenarioOutline, Scenario }) => {
  ScenarioOutline('reliability tracks the production measures', ({ Given, Then, And }, variables) => {
    let metric: Metric | undefined;
    Given('the reliability signal', () => {
      expect(RELIABILITY_SIGNAL.value.metrics.length).toBeGreaterThan(0);
    });
    Then('it includes a "<measure>" metric', () => {
      metric = RELIABILITY_SIGNAL.value.metrics.find((m) => m.label.includes(variables.measure));
      expect(metric).toBeTruthy();
    });
    And('that metric reports movement, not a target', () => {
      expect(typeof metric!.value).toBe('number');
      expect(typeof metric!.prior).toBe('number');
      expect('target' in metric!).toBe(false);
    });
  });

  Scenario('reliability is the freshest signal', ({ Given, Then }) => {
    Given('the reliability signal', () => {
      expect(RELIABILITY_SIGNAL.value.metrics.length).toBeGreaterThan(0);
    });
    Then('the signal is fresh', () => {
      expect(RELIABILITY_SIGNAL.freshness).toBe('fresh');
    });
  });
});
