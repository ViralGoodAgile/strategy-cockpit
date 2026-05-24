import { useEffect, useState } from 'react';
import { clampFrame, initialFrame, nextFrame, shouldAutoplay } from '../../lib/timeTravel';

// True when the viewer has asked the OS for reduced motion — we then don't autoplay movies.
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export interface TimeTravel {
  index: number; // current frame
  last: number; // max frame index
  playing: boolean;
  speed: number; // playback multiplier
  setIndex: (i: number) => void; // scrub — pauses playback
  setPlaying: (p: boolean) => void;
  setSpeed: (s: number) => void;
}

// Drives a frame index over [0, length-1] for a time-travel view. Autoplays (looping) unless
// the viewer prefers reduced motion; scrubbing pauses. The clock lives here so Flow and the
// triad/radar movies all behave identically.
export function useTimeTravel(length: number, intervalMs = 1100): TimeTravel {
  const reduced = prefersReducedMotion();
  const last = Math.max(0, length - 1);
  const [index, setRaw] = useState(() => initialFrame(length, reduced));
  const [playing, setPlaying] = useState(() => shouldAutoplay(length, reduced));
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!playing || length <= 1) return;
    const id = setInterval(() => setRaw((i) => nextFrame(i, last)), intervalMs / speed);
    return () => clearInterval(id);
  }, [playing, speed, last, length, intervalMs]);

  // Scrubbing is a deliberate act: it pauses the movie and holds the chosen frame.
  const setIndex = (i: number) => {
    setPlaying(false);
    setRaw(clampFrame(i, last));
  };

  return { index, last, playing, speed, setIndex, setPlaying, setSpeed };
}
