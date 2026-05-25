import { hygieneRows, hygieneSummary } from '../../lib/hygiene';
import { useCockpit } from '../../store/useCockpit';
import { hygieneAt, offsetFromNow } from '../../mirrors/snapshotHistory';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { Instrument } from './Instrument';

// Glanceable integrity ledger: one dot per signal, coloured by freshness, as of the
// dashboard's global as-of (collection has matured, so hygiene was worse earlier). The guard
// against "crap in, crap out". Expand for the full as-of table.
export function HygieneReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const scenario = useCockpit((s) => s.scenario);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const timeIndex = useCockpit((s) => s.timeIndex);

  const offset = offsetFromNow(timeIndex, PERIODS - 1);
  const asOf = periodLabel(offset, timeUnit);
  const rows = hygieneAt(hygieneRows(scenario), offset, PERIODS - 1);
  const sum = hygieneSummary(rows);

  return (
    <Instrument
      label="Data hygiene"
      sub={`crap in, crap out · ${asOf}`}
      area="hygiene"
      live={sum.stale > 0}
      onExpand={() => setDetail('hygiene')}
    >
      <div className="hyg">
        <div className="hyg-head">
          <span className="num">{sum.fresh}</span>
          <span className="hyg-of">/ {sum.total} fresh</span>
          {sum.stale > 0 && (
            <span className="hyg-warn">
              · <span className="num">{sum.stale}</span> stale
            </span>
          )}
        </div>
        <div className="hyg-dots">
          {rows.map((r) => (
            <span key={r.name} className={`hyg-dot hyg-${r.freshness}`} title={`${r.name}: ${r.freshness} (${r.age}d)`} />
          ))}
        </div>
      </div>
    </Instrument>
  );
}
