// Pure frame-stepping logic for the cockpit's "time-travel" views (Flow, and the triad /
// radar movies). Kept free of React so it can be reasoned about and tested directly.

// The next frame when playing — advance one, looping back to the start at the end.
export function nextFrame(i: number, last: number): number {
  return i >= last ? 0 : i + 1;
}

// Where a movie should sit on open. People who prefer reduced motion don't get autoplay,
// so they land on the latest frame ("now"); everyone else starts at the beginning so the
// movie plays forward through time to now.
export function initialFrame(length: number, reducedMotion: boolean): number {
  if (length <= 0) return 0;
  return reducedMotion ? length - 1 : 0;
}

// Whether a movie should autoplay on open: only when there's more than one frame AND the
// viewer hasn't asked for reduced motion.
export function shouldAutoplay(length: number, reducedMotion: boolean): boolean {
  return length > 1 && !reducedMotion;
}

// Keep a scrub position inside [0, last].
export function clampFrame(i: number, last: number): number {
  return Math.max(0, Math.min(last, i));
}
