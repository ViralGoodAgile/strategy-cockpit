import { describe, it, expect } from 'vitest';
import { FLOW_CONSTRAINT_SIGNAL } from './sensorData';
import { backlogClass, ZOMBIE_AFTER, FOSSIL_AFTER } from '../domain/sensors';

describe('flow simulation invariants', () => {
  const { frames, caps } = FLOW_CONSTRAINT_SIGNAL.value;

  it('runs eight weekly frames', () => {
    expect(frames).toHaveLength(8);
  });

  it('never exceeds station capacity, and names a valid constraint', () => {
    frames.forEach((f) => {
      expect(f.build.active.length).toBeLessThanOrEqual(caps.build);
      expect(f.review.active.length).toBeLessThanOrEqual(caps.review);
      expect(['build', 'review']).toContain(f.constraint);
    });
  });

  it('completes work monotonically (Done never shrinks)', () => {
    for (let i = 1; i < frames.length; i++) {
      expect(frames[i].done.length).toBeGreaterThanOrEqual(frames[i - 1].done.length);
    }
  });
});

describe('backlog classification', () => {
  it('thresholds live / zombie / fossil', () => {
    expect(backlogClass(ZOMBIE_AFTER)).toBe('live');
    expect(backlogClass(ZOMBIE_AFTER + 1)).toBe('zombie');
    expect(backlogClass(FOSSIL_AFTER + 1)).toBe('fossil');
  });
});
