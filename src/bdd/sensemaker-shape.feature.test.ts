import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import { driftVector, isBimodal, outlierIds } from '../mirrors/triadShape';
import type { TriadStory } from '../domain/sensors';

let seq = 0;
const st = (a: number, b: number, c: number, period: 'current' | 'prior' = 'current'): TriadStory => ({
  id: `s${seq++}`,
  role: 'role',
  text: 'a fragment',
  a,
  b,
  c,
  period,
});

const feature = await loadFeature('src/bdd/sensemaker-shape.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('a split cloud is flagged so the mean is not trusted', ({ Given, Then }) => {
    let cloud: TriadStory[] = [];
    Given('fragments clustered in two opposite corners', () => {
      cloud = [
        st(0.9, 0.05, 0.05),
        st(0.9, 0.05, 0.05),
        st(0.9, 0.05, 0.05),
        st(0.05, 0.9, 0.05),
        st(0.05, 0.9, 0.05),
        st(0.05, 0.9, 0.05),
      ];
    });
    Then('the distribution is reported as split', () => expect(isBimodal(cloud)).toBe(true));
  });

  Scenario('a single tight cluster is not called split', ({ Given, Then }) => {
    let cloud: TriadStory[] = [];
    Given('fragments gathered in one place', () => {
      cloud = Array.from({ length: 6 }, () => st(0.34, 0.33, 0.33));
    });
    Then('the distribution is not reported as split', () => expect(isBimodal(cloud)).toBe(false));
  });

  Scenario('an anomaly far from the cloud is surfaced as an outlier', ({ Given, Then, And }) => {
    const far = st(1, 0, 0);
    const cloud = [st(0.34, 0.33, 0.33), st(0.34, 0.33, 0.33), st(0.34, 0.33, 0.33), far];
    let out = new Set<string>();
    Given('a cloud with one fragment far from the rest', () => {
      out = outlierIds(cloud);
    });
    Then('that fragment is surfaced as an outlier', () => expect(out.has(far.id)).toBe(true));
    And('it is never dropped from the distribution', () =>
      expect(cloud.some((s) => s.id === far.id)).toBe(true),
    );
  });

  Scenario('too few fragments to call anything an outlier', ({ Given, Then }) => {
    let cloud: TriadStory[] = [];
    Given('only two fragments', () => {
      cloud = [st(1, 0, 0), st(0.33, 0.33, 0.34)];
    });
    Then('no fragment is called an outlier', () => expect(outlierIds(cloud).size).toBe(0));
  });

  Scenario('drift is measured as a vector — direction and magnitude', ({ Given, Then, And }) => {
    const prior = [st(0.8, 0.1, 0.1, 'prior'), st(0.8, 0.1, 0.1, 'prior')];
    const current = [st(0.1, 0.8, 0.1), st(0.1, 0.8, 0.1)];
    const d = driftVector(prior, current)!;
    Given('a prior cloud near one pole and a current cloud near another', () => expect(d).not.toBeNull());
    Then('the drift points toward the pole that gained weight', () => expect(d.toward).toBe(1));
    And('the shift is significant', () => expect(d.significant).toBe(true));
  });

  Scenario('a tiny move is reported as no significant shift', ({ Given, Then }) => {
    const prior = [st(0.34, 0.33, 0.33, 'prior')];
    const current = [st(0.35, 0.33, 0.32)];
    const d = driftVector(prior, current)!;
    Given('a prior and current cloud almost on top of each other', () => expect(d).not.toBeNull());
    Then('the drift is not significant', () => expect(d.significant).toBe(false));
  });
});
