import type { Signal } from '../../domain/types';
import type { OutcomeSet, Triad } from '../../domain/sensors';
import { Numeral, metricTrend } from '../common/Numeral';
import { SensorModule } from './SensorModule';
import { TriadChart } from './TriadChart';

// Which pole a triad leans toward in a period (mean barycentric weight).
function leanIndex(t: Triad, period: 'current' | 'prior') {
  const r = t.stories.filter((s) => s.period === period);
  const m = r.reduce((o, s) => ({ a: o.a + s.a, b: o.b + s.b, c: o.c + s.c }), { a: 0, b: 0, c: 0 });
  return [m.a, m.b, m.c].indexOf(Math.max(m.a, m.b, m.c));
}

// Product Outcomes — the full set: the PIRATE funnel (AARRR) and experience quality
// (HEART) as numbers, the customer's own voice as a Cynefin sense-making triad, and the
// prioritised unserved jobs (demand). Production reliability is its own instrument.
export function OutcomesSensor({ signal }: { signal: Signal<OutcomeSet> }) {
  const { aarrr, heart, customerTriad, jobs } = signal.value;
  const now = leanIndex(customerTriad, 'current');
  const before = leanIndex(customerTriad, 'prior');

  return (
    <SensorModule
      name="Product Outcomes"
      number={11}
      maps={signal.value.maps}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={
        <>
          Is the product moving customers’ world toward INTENT? The PIRATE funnel (AARRR) and
          experience quality (HEART) read the numbers; the customer triad reads the voice; the
          unserved customer jobs name the demand still open. Production reliability is a separate instrument.
        </>
      }
    >
      <div className="po-detail">
        <div className="po-detail-col">
          <div className="po-detail-head">Acquisition → Revenue · AARRR</div>
          <div className="outcomes-grid">
            {aarrr.map((m) => (
              <Numeral key={m.key} value={m.display} label={m.label} trend={metricTrend(m)} />
            ))}
          </div>
          <div className="po-detail-head">Experience · HEART</div>
          <div className="outcomes-grid">
            {heart.map((m) => (
              <Numeral key={m.key} value={m.display} label={m.label} trend={metricTrend(m)} />
            ))}
          </div>
        </div>

        <div className="po-detail-triad">
          <div className="po-detail-head">Customer sense-making</div>
          <p className="po-detail-q">{customerTriad.question}</p>
          <TriadChart triad={customerTriad} />
          <p className="triad-lean">
            leans <strong>“{customerTriad.poles[now].label}”</strong>
            {now !== before && <> · drifted from “{customerTriad.poles[before].label}”</>}
          </p>
          <div className="triad-interp">
            <div className="triad-interp-head">interpretations · by people, not the cockpit</div>
            {customerTriad.interpretations.map((it, i) => (
              <p className="triad-interp-row" key={i}>
                <span className="triad-interp-by">{it.by}</span>
                {it.text}
              </p>
            ))}
          </div>
        </div>

        <div className="po-detail-jobs">
          <div className="po-detail-head">Unserved customer jobs · prioritised</div>
          <ol className="outcomes-jobs">
            {[...jobs]
              .sort((a, b) => a.rank - b.rank)
              .map((j) => (
                <li key={j.id} className="outcomes-job">
                  <span className="outcomes-job-rank">{j.rank}</span>
                  <div className="outcomes-job-body">
                    <div className="outcomes-job-text">{j.job}</div>
                    <div className="outcomes-job-evidence">{j.evidence}</div>
                  </div>
                </li>
              ))}
          </ol>
        </div>
      </div>
    </SensorModule>
  );
}
