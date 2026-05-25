import type { Triad, TriadStory } from '../domain/sensors';
import { periodLabel, type TimeUnit } from '../lib/timeTravel';

// One period of a triad movie: a label ("now", "3 wks ago") and the stories signified then.
export interface TriadPeriod {
  label: string;
  stories: TriadStory[];
}

function centroid(stories: TriadStory[]): { a: number; b: number; c: number } {
  if (!stories.length) return { a: 1 / 3, b: 1 / 3, c: 1 / 3 };
  const s = stories.reduce((o, x) => ({ a: o.a + x.a, b: o.b + x.b, c: o.c + x.c }), { a: 0, b: 0, c: 0 });
  return { a: s.a / stories.length, b: s.b / stories.length, c: s.c / stories.length };
}

// Synthesise a dispositional movie for a triad: the current cloud of stories drifted back
// through time toward where it used to sit (the prior period's centroid), preserving each
// story's relative spread. Oldest first; the final period is exactly "now". Pure.
export function triadHistory(triad: Triad, periods = 6, unit: TimeUnit = 'weeks'): TriadPeriod[] {
  const N = Math.max(2, periods);
  const last = N - 1;
  const current = triad.stories.filter((s) => s.period === 'current');
  const prior = triad.stories.filter((s) => s.period === 'prior');
  const cCur = centroid(current);
  const cStart = centroid(prior.length ? prior : current);
  const shift = { a: cStart.a - cCur.a, b: cStart.b - cCur.b, c: cStart.c - cCur.c };

  return Array.from({ length: N }, (_, t) => {
    const k = 1 - t / last; // shift strength: full at the oldest period, zero at "now"
    const stories: TriadStory[] = current.map((s) => {
      let a = Math.max(0, s.a + shift.a * k);
      let b = Math.max(0, s.b + shift.b * k);
      let c = Math.max(0, s.c + shift.c * k);
      const sum = a + b + c || 1;
      return { ...s, id: `${s.id}@${t}`, a: a / sum, b: b / sum, c: c / sum, period: 'current' };
    });
    return { label: periodLabel(last - t, unit), stories };
  });
}

// The triad to render at a given period: that period's stories as "current", the previous
// period's as "prior" (so the drift line traces one step), and — only at "now" — the
// survey takers' own captured stories merged in.
export function triadAtPeriod(
  triad: Triad,
  history: TriadPeriod[],
  index: number,
  mergeCaptured: (t: Triad) => Triad,
): Triad {
  const last = history.length - 1;
  const current = history[index].stories;
  const prior = index > 0 ? history[index - 1].stories.map((s) => ({ ...s, period: 'prior' as const })) : [];
  const base: Triad = { ...triad, stories: [...current, ...prior] };
  return index === last ? mergeCaptured(base) : base;
}
