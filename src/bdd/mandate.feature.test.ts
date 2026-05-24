import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import { levelGap } from '../domain/mandate';
import type { MandateLevel } from '../domain/types';

const feature = await loadFeature('src/bdd/mandate.feature');

describeFeature(feature, ({ ScenarioOutline }) => {
  ScenarioOutline('distance between authorised and actual mandate', ({ Given, And, When, Then }, variables) => {
    let authorised: MandateLevel;
    let actual: MandateLevel;
    let gap: number;

    Given('a team authorised at <authorised>', () => {
      authorised = variables.authorised as MandateLevel;
    });
    And('work that implies <actual>', () => {
      actual = variables.actual as MandateLevel;
    });
    When('the mandate gap is computed', () => {
      gap = levelGap(authorised, actual);
    });
    Then('the gap is <gap> levels', () => {
      expect(gap).toBe(Number(variables.gap));
    });
  });
});
