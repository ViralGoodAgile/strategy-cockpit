import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import { computeMirrors } from '../mirrors/computeMirrors';
import { emptyStrategy } from '../domain/qualities';
import { SAMPLE_STRATEGY } from '../data/sample';
import type { MirrorVerdict, Strategy } from '../domain/types';

const feature = await loadFeature('src/bdd/mirrors.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('the lens produces ten verdicts, each linked to a quality', ({ Given, When, Then, And }) => {
    let strategy: Strategy;
    let v: MirrorVerdict[];
    Given('the blank strategy', () => {
      strategy = emptyStrategy();
    });
    When('the mirrors are computed', () => {
      v = computeMirrors(strategy);
    });
    Then('there are ten verdicts', () => {
      expect(v).toHaveLength(10);
    });
    And('each verdict links to a quality', () => {
      v.forEach((x) => expect(x.quality).toBeTruthy());
    });
  });

  Scenario('an empty intent is flagged', ({ Given, When, Then }) => {
    let strategy: Strategy;
    let v: MirrorVerdict[];
    Given('the blank strategy', () => {
      strategy = emptyStrategy();
    });
    When('the mirrors are computed', () => {
      v = computeMirrors(strategy);
    });
    Then('the intent verdict says it is empty', () => {
      expect(v.find((x) => x.quality === 'intent')!.body.toLowerCase()).toContain('empty');
    });
  });

  Scenario('a will-NOT contradiction is detected in the sample', ({ Given, When, Then }) => {
    let strategy: Strategy;
    let v: MirrorVerdict[];
    Given('the sample strategy', () => {
      strategy = SAMPLE_STRATEGY;
    });
    When('the mirrors are computed', () => {
      v = computeMirrors(strategy);
    });
    Then('the coherence verdict mentions a contradiction', () => {
      expect(v.find((x) => x.quality === 'coherence')!.body.toLowerCase()).toContain('contradiction');
    });
  });
});
