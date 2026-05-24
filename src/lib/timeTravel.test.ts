import { describe, it, expect } from 'vitest';
import { clampFrame, initialFrame, nextFrame, shouldAutoplay } from './timeTravel';

describe('time-travel frame logic', () => {
  it('advances one frame and loops at the end', () => {
    expect(nextFrame(0, 3)).toBe(1);
    expect(nextFrame(2, 3)).toBe(3);
    expect(nextFrame(3, 3)).toBe(0); // loop
  });

  it('starts at the beginning for motion, at "now" for reduced motion', () => {
    expect(initialFrame(6, false)).toBe(0); // play forward through time
    expect(initialFrame(6, true)).toBe(5); // land on now, paused
    expect(initialFrame(0, false)).toBe(0); // empty is safe
  });

  it('only autoplays a multi-frame movie when motion is allowed', () => {
    expect(shouldAutoplay(6, false)).toBe(true);
    expect(shouldAutoplay(6, true)).toBe(false); // reduced motion → no autoplay
    expect(shouldAutoplay(1, false)).toBe(false); // a single frame isn't a movie
  });

  it('clamps a scrub position into range', () => {
    expect(clampFrame(-2, 5)).toBe(0);
    expect(clampFrame(9, 5)).toBe(5);
    expect(clampFrame(3, 5)).toBe(3);
  });
});
