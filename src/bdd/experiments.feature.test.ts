import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import { GOAL_TREE, type ExperimentStatus } from '../data/goals';
import { allExperiments, experimentTally } from '../mirrors/experiments';
import { KVA_ORDER } from '../mirrors/ebm';

const STATUSES: ExperimentStatus[] = ['validated', 'invalidated', 'unsure'];

const feature = await loadFeature('src/bdd/experiments.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('the ladder has the three EBM levels', ({ Given, Then, And }) => {
    Given("the strategy's goal ladder", () => expect(GOAL_TREE).toBeTruthy());
    Then('it has a Strategic Goal', () => expect(GOAL_TREE.text.length).toBeGreaterThan(0));
    And('the Strategic Goal has Intermediate Goals', () =>
      expect(GOAL_TREE.intermediates.length).toBeGreaterThan(0),
    );
    And('each Intermediate Goal has Immediate Tactical Goals run as experiments', () => {
      for (const ig of GOAL_TREE.intermediates) expect(ig.experiments.length).toBeGreaterThan(0);
    });
  });

  Scenario('every experiment is a falsifiable bet on a measure', ({ Given, Then, And }) => {
    const xs = allExperiments(GOAL_TREE);
    Given("the goal ladder's experiments", () => expect(xs.length).toBeGreaterThan(0));
    Then('each carries a "we believe" hypothesis', () => {
      for (const x of xs) expect(x.hypothesis.toLowerCase()).toContain('we believe');
    });
    And('each names the value-area measure it intends to move', () => {
      for (const x of xs) expect(x.measure.length).toBeGreaterThan(0);
    });
  });

  Scenario('outcomes are scored validated, invalidated or unsure', ({ Given, Then, And }) => {
    const xs = allExperiments(GOAL_TREE);
    Given("the goal ladder's experiments", () => expect(xs.length).toBeGreaterThan(0));
    Then('each is labelled validated, invalidated or unsure', () => {
      for (const x of xs) expect(STATUSES).toContain(x.status);
    });
    And('the tally sums to the number of experiments', () => {
      const t = experimentTally(GOAL_TREE);
      expect(t.validated + t.invalidated + t.unsure).toBe(t.total);
      expect(t.total).toBe(xs.length);
    });
  });

  Scenario('the Strategic Goal names the Key Value Area it chases', ({ Given, Then }) => {
    Given('the Strategic Goal', () => expect(GOAL_TREE.text.length).toBeGreaterThan(0));
    Then('it is tied to one of the four Key Value Areas', () =>
      expect(KVA_ORDER).toContain(GOAL_TREE.kva),
    );
  });
});
