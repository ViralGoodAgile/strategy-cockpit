import { describe, it, expect } from 'vitest';
import { computeMirrors, strategyStaleness } from './computeMirrors';
import { emptyStrategy } from '../domain/qualities';
import { SAMPLE_STRATEGY } from '../data/sample';

describe('computeMirrors', () => {
  it('returns ten verdicts, each linked to a quality', () => {
    const v = computeMirrors(emptyStrategy());
    expect(v).toHaveLength(10);
    v.forEach((x) => {
      expect(x.id).toBeTruthy();
      expect(x.quality).toBeTruthy();
    });
  });

  it('flags an empty intent', () => {
    const intent = computeMirrors(emptyStrategy()).find((x) => x.quality === 'intent')!;
    expect(intent.body.toLowerCase()).toContain('empty');
  });

  it('detects a focus contradiction in the sample (will-NOT enterprise vs intent)', () => {
    const coh = computeMirrors(SAMPLE_STRATEGY).find((x) => x.quality === 'coherence')!;
    expect(coh.body.toLowerCase()).toContain('contradiction');
  });
});

describe('strategyStaleness', () => {
  it('observes when no version is saved', () => {
    expect(strategyStaleness(null).body.toLowerCase()).toContain('no version');
  });
});
