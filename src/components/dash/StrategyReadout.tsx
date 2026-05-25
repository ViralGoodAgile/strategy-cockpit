import { useCockpit } from '../../store/useCockpit';
import { offsetFromNow } from '../../mirrors/snapshotHistory';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { Instrument } from './Instrument';

// Compact, read-only strategy readout. Editing happens in Author mode (separate screen). The
// banner is the authored strategy, so it carries the dashboard's as-of rather than fabricated
// prose history.
export function StrategyReadout() {
  const draft = useCockpit((s) => s.draft);
  const setMode = useCockpit((s) => s.setMode);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const timeIndex = useCockpit((s) => s.timeIndex);
  const asOf = periodLabel(offsetFromNow(timeIndex, PERIODS - 1), timeUnit);

  return (
    <Instrument
      label="Strategy"
      sub={`${asOf} · author ›`}
      area="strategy"
      onExpand={() => setMode('author')}
    >
      <div className="sr">
        <div className="sr-main">
          <p className="sr-intent">{draft.intent.text || 'No intent set — author your strategy.'}</p>
        </div>
        <div className="sr-meta">
          <div className="sr-chips">
            {draft.context.cynefin && <span className="sr-chip">{draft.context.cynefin}</span>}
            {draft.focus.wipCap != null && <span className="sr-chip">WIP cap {draft.focus.wipCap}</span>}
            {draft.focus.willNot.length > 0 && (
              <span className="sr-chip sr-chip-not">won’t: {draft.focus.willNot.join(', ')}</span>
            )}
          </div>
          {draft.context.crux && <p className="sr-crux">Crux — {draft.context.crux}</p>}
        </div>
      </div>
    </Instrument>
  );
}
