import type { Freshness, MandateLevel } from '../domain/types';
import type { HygieneRow } from '../lib/hygiene';
import type { WeakSignal } from '../domain/sensors';
import { MANDATE_ORDER, levelGap, levelIndex } from '../domain/mandate';

const WORSE: Record<Freshness, Freshness> = { fresh: 'aging', aging: 'stale', stale: 'dead', dead: 'dead' };

// How many periods back from "now" a frame sits.
export const offsetFromNow = (index: number, last: number) => Math.max(0, last - index);

// Human interpretations accrue over time: people add readings as more stories come in, so an
// earlier period shows fewer of them (the later ones hadn't been written yet). At least one
// reading always shows; at "now" they all do. Pure.
export function interpretationsAt<T>(interps: T[], index: number, last: number): T[] {
  if (last <= 0 || interps.length === 0) return interps;
  const n = Math.max(1, Math.ceil((interps.length * (index + 1)) / (last + 1)));
  return interps.slice(0, n);
}

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

// The authored intent/crux as a survey-taker would have read it. Authored prose has a REAL
// history (the strategy's saved versions), so we don't fabricate a custom author's words: a
// history is supplied only for the seed strategy; otherwise every period reads the current
// text. `history` is oldest→newest, aligned to frames 0..last. Pure.
export interface StrategyProse {
  intent: string;
  crux: string;
}
export function strategyProseAt(
  history: StrategyProse[],
  current: StrategyProse,
  index: number,
  last: number,
): StrategyProse {
  if (!history.length) return current;
  const span = last > 0 ? last : history.length - 1;
  // map the frame onto the history array (which may be a different length than the timeline).
  const i = span <= 0 ? history.length - 1 : Math.round((index / span) * (history.length - 1));
  return history[Math.max(0, Math.min(history.length - 1, i))] ?? current;
}

// The work-implied actual mandate level as it sat `offset` periods ago. The authorised↔actual
// gap has narrowed toward now, so earlier the actual sat FURTHER from authorised — up to two
// steps wider, in the same direction as today's gap (defaulting to "more ambitious"). Pure.
export function actualAt(
  actualNow: MandateLevel,
  authorised: MandateLevel,
  offset: number,
  last: number,
): MandateLevel {
  if (offset <= 0) return actualNow;
  const dir = Math.sign(levelGap(authorised, actualNow)) || 1; // away-from-authorised (default up)
  const extra = Math.round((last > 0 ? offset / last : 0) * 2); // up to +2 steps wider earlier
  const idx = Math.max(0, Math.min(MANDATE_ORDER.length - 1, levelIndex(actualNow) + dir * extra));
  return MANDATE_ORDER[idx];
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
