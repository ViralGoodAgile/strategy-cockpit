import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import { backlogClass } from '../domain/sensors';

const feature = await loadFeature('src/bdd/backlog.feature');

describeFeature(feature, ({ ScenarioOutline }) => {
  ScenarioOutline('classify a backlog item by how long it is untouched', ({ Given, When, Then }, variables) => {
    let age: number;
    let klass: string;
    Given('a backlog item untouched for <age> days', () => {
      age = Number(variables.age);
    });
    When('it is classified', () => {
      klass = backlogClass(age);
    });
    Then('it is <class>', () => {
      expect(klass).toBe(variables.class);
    });
  });
});
