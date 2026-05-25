import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import { SYSTEM_MODEL_SIGNAL } from '../data/sensorData';
import { systemModelAt } from '../mirrors/systemModelHistory';
import type { SystemModel } from '../domain/sensors';

const models = SYSTEM_MODEL_SIGNAL.value;
const withCausation = (): SystemModel => models.find((m) => m.links.some((l) => l.kind === 'causation'))!;
const edges = (m: SystemModel) => new Set(m.links.map((l) => `${l.from}->${l.to}`));
const count = (m: SystemModel, kind: string) => m.links.filter((l) => l.kind === kind).length;

const feature = await loadFeature('src/bdd/system-model-history.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('the model\'s "now" equals the live CLD', ({ Given, When, Then }) => {
    const m = models[0];
    let now: SystemModel = m;
    Given('a seed system model', () => expect(m.links.length).toBeGreaterThan(0));
    When('its history is read at "now"', () => {
      now = systemModelAt(m, 0, 5);
    });
    Then('it is exactly today\'s model', () => expect(now).toBe(m));
  });

  Scenario('links are drawn over time, so earlier periods are sparser', ({ Given, Then }) => {
    const m = models[0];
    Given('a seed system model', () => expect(m.links.length).toBeGreaterThan(2));
    Then('an earlier period has fewer links than now', () => {
      expect(systemModelAt(m, 5, 5).links.length).toBeLessThan(m.links.length);
    });
  });

  Scenario('a link is re-routed, so earlier and now disagree on direction', ({ Given, Then, And }) => {
    const m = models[0];
    const early = edges(systemModelAt(m, 5, 5));
    const now = edges(m);
    Given('a seed system model', () => expect(m.links.length).toBeGreaterThan(2));
    Then('an earlier period carries a directed link the present lacks', () => {
      expect([...early].some((e) => !now.has(e))).toBe(true);
    });
    And('the present carries a directed link that earlier period lacks', () => {
      expect([...now].some((e) => !early.has(e))).toBe(true);
    });
  });

  Scenario('confidence matures from hypothesis toward causation', ({ Given, Then }) => {
    const m = withCausation();
    Given('a seed system model that names a causation', () => expect(count(m, 'causation')).toBeGreaterThan(0));
    Then('an earlier period has fewer causations and more hypotheses than now', () => {
      const early = systemModelAt(m, 5, 5);
      expect(count(early, 'causation')).toBeLessThan(count(m, 'causation'));
      expect(count(early, 'hypothesis')).toBeGreaterThan(count(systemModelAt(m, 0, 5), 'hypothesis'));
    });
  });

  Scenario('a belief about a sign can reverse, coherently', ({ Given, Then }) => {
    const loop: SystemModel = {
      name: 'loop',
      note: '',
      maps: [],
      variables: [
        { id: 'a', label: 'A', x: 0, y: 0 },
        { id: 'b', label: 'B', x: 0, y: 0 },
        { id: 'c', label: 'C', x: 0, y: 0 },
      ],
      links: [
        { from: 'a', to: 'b', sign: '+', kind: 'correlation' },
        { from: 'b', to: 'c', sign: '+', kind: 'correlation' },
        { from: 'c', to: 'a', sign: '+', kind: 'correlation' },
      ],
      loops: [],
    };
    Given('a causal loop whose links all read "+"', () => expect(loop.links.every((l) => l.sign === '+')).toBe(true));
    Then('an earlier period reads at least one link as "−"', () => {
      expect(systemModelAt(loop, 5, 5).links.some((l) => l.sign === '-')).toBe(true);
    });
  });
});
