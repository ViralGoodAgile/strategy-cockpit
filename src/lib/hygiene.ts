import type { Freshness } from '../domain/types';
import { ageInDays } from './freshness';
import { SCENARIOS } from '../data/scenarios';
import type { ScenarioId } from '../data/scenarios';
import { MANDATE_SIGNAL } from '../data/synthetic';
import {
  DATADOG_SIGNAL,
  DORA_SIGNAL,
  FLOW_CONSTRAINT_SIGNAL,
  OUTCOMES_SIGNAL,
  RADAR_SIGNAL,
  RELIABILITY_SIGNAL,
  SYSTEM_MODEL_SIGNAL,
  TRIAD_SIGNAL,
  WEAK_SIGNAL,
} from '../data/sensorData';

// One sensor's provenance: how old its reading is, and how trustworthy that makes it.
export interface HygieneRow {
  name: string;
  observedAt: string;
  freshness: Freshness;
  age: number; // whole days
}

// Every signal feeding the cockpit, with its freshness envelope.
const SIGNALS: { name: string; sig: { observedAt: string; freshness: Freshness } }[] = [
  { name: 'Mandate Levels', sig: MANDATE_SIGNAL },
  { name: 'Cynefin triads', sig: TRIAD_SIGNAL },
  { name: 'Flow.Constraint', sig: FLOW_CONSTRAINT_SIGNAL },
  { name: 'DORA.Metrics', sig: DORA_SIGNAL },
  { name: 'DataDog.Ingest', sig: DATADOG_SIGNAL },
  { name: 'Weak signals', sig: WEAK_SIGNAL },
  { name: 'System model', sig: SYSTEM_MODEL_SIGNAL },
  { name: 'Radar', sig: RADAR_SIGNAL },
  { name: 'Product outcomes', sig: OUTCOMES_SIGNAL },
  { name: 'Reliability', sig: RELIABILITY_SIGNAL },
];

const RANK: Record<Freshness, number> = { fresh: 0, aging: 1, stale: 2, dead: 3 };
// One rank worse — used by the "crap in" scenario to degrade every signal.
const WORSE: Record<Freshness, Freshness> = { fresh: 'aging', aging: 'stale', stale: 'dead', dead: 'dead' };

// The hygiene ledger, worst (least trustworthy) first. A demo scenario can degrade every
// signal's freshness so "crap in, crap out" is visible in the ledger.
export function hygieneRows(scenario: ScenarioId = 'baseline'): HygieneRow[] {
  const degrade = !!SCENARIOS[scenario].degradeHygiene;
  return SIGNALS.map(({ name, sig }) => ({
    name,
    observedAt: sig.observedAt,
    freshness: degrade ? WORSE[sig.freshness] : sig.freshness,
    age: ageInDays(sig.observedAt),
  })).sort((a, b) => RANK[b.freshness] - RANK[a.freshness] || b.age - a.age);
}

export function hygieneSummary(rows: HygieneRow[]) {
  const fresh = rows.filter((r) => r.freshness === 'fresh').length;
  const stale = rows.filter((r) => r.freshness === 'stale' || r.freshness === 'dead').length;
  // "present-but-stale" = looks live in the cockpit but its data is no longer current.
  const presentButStale = rows.length - fresh;
  return { total: rows.length, fresh, stale, presentButStale };
}
