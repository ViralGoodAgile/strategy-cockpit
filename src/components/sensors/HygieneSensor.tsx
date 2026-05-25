import { hygieneRows, hygieneSummary } from '../../lib/hygiene';
import { ageInDays } from '../../lib/freshness';
import { useCockpit } from '../../store/useCockpit';
import { hygieneAt, offsetFromNow } from '../../mirrors/snapshotHistory';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { useTimeTravel } from '../common/useTimeTravel';
import { Transport } from '../common/Transport';

// The full hygiene ledger as a time-travel movie: scrub or play to watch collection mature
// (signals were staler earlier). The cockpit's integrity guard — a finding is only as good as
// its inputs, and a present-but-stale signal is worse than an absent one.
export function HygieneSensor() {
  const scenario = useCockpit((s) => s.scenario);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const tt = useTimeTravel(PERIODS);
  const asOf = periodLabel(offsetFromNow(tt.index, tt.last), timeUnit);
  const rows = hygieneAt(hygieneRows(scenario), offsetFromNow(tt.index, tt.last), tt.last);
  const sum = hygieneSummary(rows);

  const ageText = (iso: string) => {
    const d = ageInDays(iso);
    return d === 0 ? 'today' : d === 1 ? '1 day ago' : `${d} days ago`;
  };

  return (
    <div className="hyg-detail">
      <p className="hyg-lead">
        <strong>{asOf}</strong>: every signal carries its as-of and a freshness verdict. Findings
        inherit their inputs’ worst freshness — and a <strong>present-but-stale</strong> sensor is
        worse than an absent one: it looks live but lies. {sum.fresh} of {sum.total} signals are
        fresh; {sum.presentButStale} are past their cadence{sum.stale > 0 ? `, ${sum.stale} stale` : ''}.
      </p>
      <Transport tt={tt} label={asOf} granularity />
      <ul className="hyg-ledger">
        {rows.map((r) => (
          <li className="hyg-row" key={r.name}>
            <span className={`hyg-pip hyg-${r.freshness}`} />
            <span className="hyg-name">{r.name}</span>
            <span className="hyg-asof">observed {ageText(r.observedAt)}</span>
            <span className={`hyg-state hyg-text-${r.freshness}`}>{r.freshness}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
