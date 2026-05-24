import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import { composeChallenges } from '../challenge/composeChallenge';
import { SAMPLE_STRATEGY } from '../data/sample';
import { emptyStrategy } from '../domain/qualities';
import type { Challenge, Strategy } from '../domain/types';

const feature = await loadFeature('src/bdd/challenges.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('the sample strategy fires every applicable cross-sensor challenge', ({ Given, When, Then, And }) => {
    let strategy: Strategy;
    let cs: Challenge[];
    Given('the sample strategy', () => {
      strategy = SAMPLE_STRATEGY;
    });
    When('challenges are composed', () => {
      cs = composeChallenges(strategy);
    });
    Then('a focus-mandate challenge is raised', () => {
      expect(cs.map((c) => c.id)).toContain('focus-mandate');
    });
    And('a wip-cap challenge is raised', () => {
      expect(cs.map((c) => c.id)).toContain('wip-cap');
    });
    And('a sense-context challenge is raised', () => {
      expect(cs.map((c) => c.id)).toContain('sense-context');
    });
    And('every challenge carries a freshness and a source', () => {
      cs.forEach((c) => {
        expect(c.freshness).toBeTruthy();
        expect(c.source).toBeTruthy();
      });
    });
  });

  Scenario('a blank strategy falls back to the mandate gap', ({ Given, When, Then }) => {
    let strategy: Strategy;
    let cs: Challenge[];
    Given('a blank strategy', () => {
      strategy = emptyStrategy();
    });
    When('challenges are composed', () => {
      cs = composeChallenges(strategy);
    });
    Then('a mandate-gap challenge is raised', () => {
      expect(cs.map((c) => c.id)).toContain('mandate-gap');
    });
  });
});
