// Pure frame-stepping logic for the cockpit's "time-travel" views (Flow, and the triad /
// radar movies). Kept free of React so it can be reasoned about and tested directly.

// How many frames a movie / the global timeline carries.
export const PERIODS = 6;

// The granularity a time-travel timeline is read at — a dashboard-wide preference.
export type TimeUnit = 'weeks' | 'months' | 'quarters' | 'halves' | 'years';
export const TIME_UNITS: TimeUnit[] = ['weeks', 'months', 'quarters', 'halves', 'years'];

const UNIT_WORD: Record<TimeUnit, { one: string; many: string }> = {
  weeks: { one: 'wk', many: 'wks' },
  months: { one: 'mo', many: 'mo' },
  quarters: { one: 'qtr', many: 'qtrs' },
  halves: { one: 'half', many: 'halves' },
  years: { one: 'yr', many: 'yrs' },
};
const UNIT_LABEL: Record<TimeUnit, string> = {
  weeks: 'weeks',
  months: 'months',
  quarters: 'quarters',
  halves: 'half-years',
  years: 'years',
};
export const unitLabel = (u: TimeUnit) => UNIT_LABEL[u];

// Label for a frame, given how many steps back from "now" it sits ("now", "3 mo ago").
export function periodLabel(offsetFromNow: number, unit: TimeUnit): string {
  if (offsetFromNow <= 0) return 'now';
  const w = UNIT_WORD[unit];
  return `${offsetFromNow} ${offsetFromNow === 1 ? w.one : w.many} ago`;
}

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
