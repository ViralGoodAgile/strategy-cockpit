import { describe, it, expect } from 'vitest';
import { composeChallenges } from './composeChallenge';
import { SAMPLE_STRATEGY } from '../data/sample';
import { emptyStrategy } from '../domain/qualities';

describe('composeChallenges', () => {
  it('fires every applicable cross-sensor challenge for the sample', () => {
    const cs = composeChallenges(SAMPLE_STRATEGY);
    const ids = cs.map((c) => c.id);
    expect(ids).toContain('focus-mandate'); // will-NOT enterprise vs enterprise WIP
    expect(ids).toContain('wip-cap'); // work in flight > strategic cap
    expect(ids).toContain('sense-context'); // Complex context vs analysis lean
    cs.forEach((c) => {
      expect(c.freshness).toBeTruthy();
      expect(c.source).toBeTruthy();
    });
  });

  it('falls back to a mandate gap for a blank strategy', () => {
    const cs = composeChallenges(emptyStrategy());
    expect(cs.length).toBeGreaterThanOrEqual(1);
    expect(cs.map((c) => c.id)).toContain('mandate-gap');
  });
});
