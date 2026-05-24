import { describe, it, expect } from 'vitest';
import { resolveSignal } from './snapshot';

describe('SignalSource seam — resolveSignal', () => {
  it('uses the synthetic fallback when the snapshot has no override', () => {
    expect(resolveSignal('synthetic', undefined)).toBe('synthetic');
  });

  it('prefers the real override when the snapshot provides one', () => {
    expect(resolveSignal('synthetic', 'real')).toBe('real');
  });

  it('honours a real 0 / empty value (only undefined falls back)', () => {
    expect(resolveSignal(5, 0)).toBe(0);
    expect(resolveSignal('x', '')).toBe('');
  });
});
