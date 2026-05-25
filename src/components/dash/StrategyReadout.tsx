import { useCockpit } from '../../store/useCockpit';
import { offsetFromNow, strategyProseAt } from '../../mirrors/snapshotHistory';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { SAMPLE_STRATEGY, STRATEGY_PROSE_HISTORY } from '../../data/sample';
import { Instrument } from './Instrument';

// Compact, read-only strategy readout. Editing happens in Author mode (separate screen). The
// authored intent and crux travel: the seed strategy carries a real prose history (a broad early
// intent sharpening over time), so the banner reads "as of" the dashboard's period. A custom
// strategy shows its current words at every period — we never fabricate an author's wording.
export function StrategyReadout() {
  const draft = useCockpit((s) => s.draft);
  const setMode = useCockpit((s) => s.setMode);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const timeIndex = useCockpit((s) => s.timeIndex);
  const last = PERIODS - 1;
  const asOf = periodLabel(offsetFromNow(timeIndex, last), timeUnit);

  // History applies only to the unedited seed; otherwise the current words stand for all periods.
  const isSeed = draft.intent.text === SAMPLE_STRATEGY.intent.text;
  const current = { intent: draft.intent.text, crux: draft.context.crux };
  const prose = strategyProseAt(isSeed ? STRATEGY_PROSE_HISTORY : [], current, timeIndex, last);

  return (
    <Instrument
      label="Strategy"
      sub={`${asOf} · author ›`}
      area="strategy"
      onExpand={() => setMode('author')}
    >
      <div className="sr">
        <div className="sr-main">
          <p className="sr-intent">{prose.intent || 'No intent set — author your strategy.'}</p>
        </div>
        <div className="sr-meta">
          <div className="sr-chips">
            {draft.context.cynefin && <span className="sr-chip">{draft.context.cynefin}</span>}
            {draft.focus.wipCap != null && <span className="sr-chip">WIP cap {draft.focus.wipCap}</span>}
            {draft.focus.willNot.length > 0 && (
              <span className="sr-chip sr-chip-not">won’t: {draft.focus.willNot.join(', ')}</span>
            )}
          </div>
          {prose.crux && <p className="sr-crux">Crux — {prose.crux}</p>}
        </div>
      </div>
    </Instrument>
  );
}
