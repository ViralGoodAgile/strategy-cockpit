import type { Impediment, RadarSet } from '../domain/sensors';
import { periodLabel, type TimeUnit } from '../lib/timeTravel';

// One period of the radar movie: a label and the impediments on the scope then.
export interface RadarSnapshot {
  label: string;
  set: RadarSet;
}

const SEV_ORDER: Impediment['severity'][] = ['low', 'med', 'high'];
const demote = (s: Impediment['severity'], notches: number): Impediment['severity'] =>
  SEV_ORDER[Math.max(0, SEV_ORDER.indexOf(s) - notches)];

// Synthesise the radar's history: impediments are raised over time (high-severity ones
// linger longest, so they read as raised earliest; others emerge later and escalate as
// they age), and one impediment was present early but has since been resolved — so playing
// the scope shows emerging vs fading blips as motion. Oldest first; final period is "now"
// and equals the current scope. Pure.
export function radarHistory(current: RadarSet, periods = 6, unit: TimeUnit = 'weeks'): RadarSnapshot[] {
  const N = Math.max(1, periods);
  const last = N - 1;
  const items = current.impediments;

  // when each impediment was first raised
  const raised = new Map<string, number>();
  items.forEach((im, idx) => {
    const base = im.severity === 'high' ? 0 : im.severity === 'med' ? Math.round(N / 3) : Math.round((2 * N) / 3);
    raised.set(im.id, Math.min(last, base + (idx % 2)));
  });

  // an impediment that was live early and has since been resolved (absent by "now")
  const resolved: Impediment = {
    id: 'i-resolved',
    level: 'function',
    label: 'On-call rota gaps (since resolved)',
    severity: 'med',
    angle: 250,
  };
  const resolvedUntil = Math.max(0, Math.round(N / 2) - 1);

  return Array.from({ length: N }, (_, t) => {
    const live: Impediment[] = [];
    if (t <= resolvedUntil) live.push(resolved);
    items.forEach((im) => {
      const r = raised.get(im.id)!;
      if (r <= t) {
        const age = t - r;
        // a young impediment reads one notch milder; full severity once it's aged or at "now"
        const severity = age >= 2 || t === last ? im.severity : demote(im.severity, 1);
        live.push({ ...im, severity });
      }
    });
    return { label: periodLabel(last - t, unit), set: { maps: current.maps, impediments: live } };
  });
}
