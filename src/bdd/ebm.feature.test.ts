import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import { KVA_ORDER, metricDirection, valueAreas, type KvaArea } from '../mirrors/ebm';
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

const areas = (): KvaArea[] =>
  valueAreas({
    currentValue: [metric(100, 140, 'higher')],
    timeToMarket: [metric(60, 40, 'lower')],
    throughput: [5, 9],
    unservedJobs: 3,
    weakSignals: 4,
    mandateMedianGap: 1,
  });

const feature = await loadFeature('src/bdd/ebm.feature');

describeFeature(feature, ({ Scenario, ScenarioOutline }) => {
  Scenario('all four Key Value Areas are represented', ({ Given, Then }) => {
    let a: KvaArea[] = [];
    Given("the cockpit's value areas", () => {
      a = areas();
    });
    Then('Current Value, Unrealized Value, Time to Market and Ability to Innovate are all present', () => {
      expect(a.map((x) => x.id)).toEqual(KVA_ORDER);
    });
  });

  ScenarioOutline(
    'a measure leads with direction of travel',
    ({ Given, Then }, variables) => {
      const from = Number(variables.from);
      const to = Number(variables.to);
      const better = variables.better as 'higher' | 'lower';
      Given('a metric whose series runs "<from>" to "<to>" where "<better>" is better', () => {
        expect(Number.isFinite(from)).toBe(true);
      });
      Then('its EBM direction reads "<direction>"', () => {
        expect(metricDirection(metric(from, to, better))).toBe(variables.direction);
      });
    },
  );

  Scenario('Unrealized Value is read as the open-jobs gap, not a number', ({ Given, Then }) => {
    let a: KvaArea[] = [];
    Given("the cockpit's value areas", () => {
      a = areas();
    });
    Then('Unrealized Value names the unserved customer jobs still open', () => {
      const uv = a.find((x) => x.id === 'UV')!;
      expect(uv.measures.some((m) => /unserved/i.test(m.label))).toBe(true);
    });
  });

  Scenario('a measure is an outcome, never an output count', ({ Given, Then }) => {
    let a: KvaArea[] = [];
    Given("the cockpit's value areas", () => {
      a = areas();
    });
    Then('no measure is labelled with story points, stories shipped or velocity', () => {
      const labels = a.flatMap((x) => x.measures.map((m) => m.label.toLowerCase()));
      expect(labels.some((l) => /story points|stories shipped|velocity/.test(l))).toBe(false);
    });
  });
});
