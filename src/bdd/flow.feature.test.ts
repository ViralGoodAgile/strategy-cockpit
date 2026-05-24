import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import { FLOW_CONSTRAINT_SIGNAL } from '../data/sensorData';

const feature = await loadFeature('src/bdd/flow.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('the simulation respects capacity and completes monotonically', ({ Given, Then, And }) => {
    const { frames, caps } = FLOW_CONSTRAINT_SIGNAL.value;
    Given('the flow simulation', () => {
      expect(frames.length).toBeGreaterThan(0);
    });
    Then('no station ever exceeds its active capacity', () => {
      frames.forEach((f) => {
        expect(f.build.active.length).toBeLessThanOrEqual(caps.build);
        expect(f.review.active.length).toBeLessThanOrEqual(caps.review);
      });
    });
    And('the Done count never decreases', () => {
      for (let i = 1; i < frames.length; i++) {
        expect(frames[i].done.length).toBeGreaterThanOrEqual(frames[i - 1].done.length);
      }
    });
    And('every frame names a valid constraint', () => {
      frames.forEach((f) => expect(['build', 'review']).toContain(f.constraint));
    });
  });
});
