import { describe, it, expect } from 'vitest';
import { triadsWithCaptured } from './capturedTriads';
import type { CapturedStory, Triad } from '../domain/sensors';

const triad: Triad = {
  id: 't1',
  title: 'T',
  question: 'q',
  poles: [
    { id: 'p0', label: 'P0', short: 'P0' },
    { id: 'p1', label: 'P1', short: 'P1' },
    { id: 'p2', label: 'P2', short: 'P2' },
  ],
  stories: [],
  interpretations: [],
  maps: [],
};

const cap = (over: Partial<CapturedStory>): CapturedStory => ({
  id: 'c1',
  triadId: 't1',
  role: 'PM',
  text: 'x',
  a: 0.6,
  b: 0.2,
  c: 0.2,
  at: '2026-01-01T00:00:00Z',
  ...over,
});

describe('triadsWithCaptured', () => {
  it('returns the same array when there are no captures', () => {
    const input = [triad];
    expect(triadsWithCaptured(input, [])).toBe(input); // early return, no copy
  });

  it('appends a matching capture as a current-period story', () => {
    const out = triadsWithCaptured([triad], [cap({})]);
    expect(out[0].stories).toHaveLength(1);
    expect(out[0].stories[0].period).toBe('current');
    expect(out[0].stories[0].role).toBe('PM');
  });

  it('ignores captures for a different triad', () => {
    const out = triadsWithCaptured([triad], [cap({ id: 'c2', triadId: 'other' })]);
    expect(out[0].stories).toHaveLength(0);
  });
});
