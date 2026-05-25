import type { Freshness } from '../domain/types';
import type { HygieneRow } from '../lib/hygiene';
import type { WeakSignal } from '../domain/sensors';

const WORSE: Record<Freshness, Freshness> = { fresh: 'aging', aging: 'stale', stale: 'dead', dead: 'dead' };

// How many periods back from "now" a frame sits.
export const offsetFromNow = (index: number, last: number) => Math.max(0, last - index);

// Weak signals emerge over time: a signal only existed `offset` periods ago if it had been
// observed for longer than that, so earlier periods surface fewer. Pure.
export function weakSignalsAt(signals: WeakSignal[], offset: number): WeakSignal[] {
  return offset <= 0 ? signals : signals.filter((s) => s.sinceWeeks > offset);
}

// Mandate gaps were wider earlier (the authorised↔actual misalignment has narrowed): scale
// each gap up the further back you look. Pure.
export function mandateGapsAt(gaps: number[], offset: number, last: number): number[] {
  const f = 1 + (last > 0 ? offset / last : 0);
  return gaps.map((g) => Math.round(g * f));
}

// Data hygiene was worse earlier (collection has matured): degrade each signal's freshness by
// up to ~1–2 ranks the further back you look. Pure.
export function hygieneAt(rows: HygieneRow[], offset: number, last: number): HygieneRow[] {
  const steps = Math.round((last > 0 ? offset / last : 0) * 1.5);
  if (steps <= 0) return rows;
  const worse = (f: Freshness): Freshness => {
    let r = f;
    for (let i = 0; i < steps; i++) r = WORSE[r];
    return r;
  };
  return rows.map((r) => ({ ...r, freshness: worse(r.freshness) }));
}
