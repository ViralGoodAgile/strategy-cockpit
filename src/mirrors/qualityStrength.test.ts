import { describe, it, expect } from 'vitest';
import { qualityStrength } from './qualityStrength';
import { SAMPLE_STRATEGY } from '../data/sample';
import { emptyStrategy } from '../domain/qualities';
import type { QualityId } from '../domain/types';

const IDS: QualityId[] = [
  'intent',
  'context',
  'focus',
  'coherence',
  'quantification',
  'decisions',
  'learning',
  'emergence',
  'participation',
  'durability',
];

describe('qualityStrength', () => {
  it('scores an empty strategy at zero across every quality', () => {
    const s = qualityStrength(emptyStrategy());
    for (const id of IDS) expect(s[id]).toBe(0);
  });

  it('keeps every score within 0..1', () => {
    const s = qualityStrength(SAMPLE_STRATEGY);
    for (const id of IDS) {
      expect(s[id]).toBeGreaterThanOrEqual(0);
      expect(s[id]).toBeLessThanOrEqual(1);
    }
  });

  it('credits Focus for a WIP cap + will-not list, and Context for crux + cynefin', () => {
    const s = qualityStrength(SAMPLE_STRATEGY);
    expect(s.focus).toBeGreaterThanOrEqual(0.5); // willNot (0.3) + wipCap (0.2)
    expect(s.context).toBeGreaterThanOrEqual(0.5); // crux (0.25) + cynefin (0.25)
  });

  it('rewards double-loop learning and operable (negative) decisions', () => {
    const base = emptyStrategy();
    const plain = qualityStrength({
      ...base,
      learning: { text: 'we review weekly' },
      decisions: { text: 'we ship things' },
    });
    const sharp = qualityStrength({
      ...base,
      learning: { text: 'we question our assumptions' }, // double-loop keyword
      decisions: { text: 'we will not add settings' }, // operable (negative) keyword
    });
    expect(sharp.learning).toBeGreaterThan(plain.learning);
    expect(sharp.decisions).toBeGreaterThan(plain.decisions);
  });
});
