import { hygieneRows, hygieneSummary } from '../../lib/hygiene';
import { ageInDays } from '../../lib/freshness';

// The full hygiene ledger. The cockpit's integrity guard: a finding is only as good as
// its inputs, and a present-but-stale signal is worse than an absent one.
export function HygieneSensor() {
  const rows = hygieneRows();
  const sum = hygieneSummary(rows);

  const ageText = (iso: string) => {
    const d = ageInDays(iso);
    return d === 0 ? 'today' : d === 1 ? '1 day ago' : `${d} days ago`;
  };

  return (
    <div className="hyg-detail">
      <p className="hyg-lead">
        Every signal carries its as-of and a freshness verdict. Findings inherit their inputs’ worst
        freshness — and a <strong>present-but-stale</strong> sensor is worse than an absent one: it
        looks live but lies. {sum.fresh} of {sum.total} signals are fresh; {sum.presentButStale} are
        past their cadence{sum.stale > 0 ? `, ${sum.stale} stale` : ''}.
      </p>
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
