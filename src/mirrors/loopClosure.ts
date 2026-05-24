import type { Closure, StrategyVersion } from '../domain/types';
import { OUTCOMES_SIGNAL } from '../data/sensorData';
import { SCENARIOS } from '../data/scenarios';
import type { ScenarioId } from '../data/scenarios';

// Loop.Closure for the RETURN path (Reality → Intent): is there evidence that a real
// outcome shift fed back into an Intent revision? Evidence-driven, not a manual toggle.
// This is a heuristic correlation (temporal), NOT ratified causation — framed as such.
export interface LoopClosure {
  state: Closure; // flow = closed (return path alive), stop = open (no feedback)
  evidence: string;
  closed: boolean;
}

export function loopClosure(
  versions: StrategyVersion[],
  scenario: ScenarioId = 'baseline',
): LoopClosure {
  // A demo scenario can override the verdict so the return path visibly reacts.
  const override = SCENARIOS[scenario].loop;
  if (override) {
    return { state: override.state, evidence: override.evidence, closed: override.closed };
  }

  // Has reality moved? (a product outcome whose value differs from its prior)
  const moved = [...OUTCOMES_SIGNAL.value.aarrr, ...OUTCOMES_SIGNAL.value.heart].find(
    (m) => m.value !== m.prior,
  );
  const outcomeNote = moved
    ? `${moved.label} ${moved.prior}${moved.unit}→${moved.value}${moved.unit}`
    : 'production outcomes';

  if (versions.length >= 2) {
    const latest = versions[versions.length - 1];
    const prev = versions[versions.length - 2];
    if (latest.strategy.intent.text.trim() !== prev.strategy.intent.text.trim()) {
      return {
        state: 'flow',
        closed: true,
        evidence: `Intent was revised in v${latest.version} after reality moved (${outcomeNote}). The return path is closed — a candidate closure (temporal correlation, not yet ratified).`,
      };
    }
  }

  const span = versions.length
    ? ` across ${versions.length} version${versions.length > 1 ? 's' : ''}`
    : ' (no version saved)';
  return {
    state: 'stop',
    closed: false,
    evidence: `Reality has moved (${outcomeNote}) but Intent is unchanged${span}. The return path is stopped — the loop is open. Revise Intent in response to close it.`,
  };
}
