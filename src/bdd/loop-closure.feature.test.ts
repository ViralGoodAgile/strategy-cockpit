import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import { loopClosure } from '../mirrors/loopClosure';
import { emptyStrategy } from '../domain/qualities';
import type { StrategyVersion } from '../domain/types';

const ver = (version: string, intent: string): StrategyVersion => {
  const strategy = emptyStrategy();
  strategy.intent.text = intent;
  return { version, savedAt: new Date().toISOString(), strategy };
};

const feature = await loadFeature('src/bdd/loop-closure.feature');

describeFeature(feature, ({ Scenario, ScenarioOutline }) => {
  Scenario('open when no version is saved', ({ Given, When, Then }) => {
    let result: ReturnType<typeof loopClosure>;
    Given('no saved versions', () => {});
    When('loop closure is evaluated', () => {
      result = loopClosure([]);
    });
    Then('the return path is open', () => {
      expect(result.closed).toBe(false);
    });
  });

  ScenarioOutline('closure depends on whether Intent changed', ({ Given, And, When, Then }, variables) => {
    const versions: StrategyVersion[] = [];
    let result: ReturnType<typeof loopClosure>;
    Given('a version with intent <first>', () => {
      versions.push(ver('0.1', variables.first));
    });
    And('a later version with intent <second>', () => {
      versions.push(ver('0.2', variables.second));
    });
    When('loop closure is evaluated', () => {
      result = loopClosure(versions);
    });
    Then('the return path is <state>', () => {
      expect(result.closed).toBe(variables.state === 'closed');
    });
  });
});
