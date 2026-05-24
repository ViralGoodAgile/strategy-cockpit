import { OUTCOMES_SIGNAL } from '../../data/sensorData';
import type { Metric, Triad } from '../../domain/sensors';
import { useCockpit } from '../../store/useCockpit';
import { MetricTrend } from '../common/MetricTrend';
import { TriadChart } from '../sensors/TriadChart';
import { Instrument } from './Instrument';

// Which pole a triad's stories lean toward in a period (mean barycentric weight).
function leanIndex(triad: Triad, period: 'current' | 'prior'): number {
  const r = triad.stories.filter((s) => s.period === period);
  const m = r.reduce((o, s) => ({ a: o.a + s.a, b: o.b + s.b, c: o.c + s.c }), { a: 0, b: 0, c: 0 });
  return [m.a, m.b, m.c].indexOf(Math.max(m.a, m.b, m.c));
}

// One lens (AARRR or HEART): a compact grid of name · value · direction-of-travel. The
// full-width bottom row gives us room to lay the metrics two-up, so five measures cost
// three rows, not five. Labels show the headline word; the full definition is on hover.
function Lens({ title, metrics }: { title: string; metrics: Metric[] }) {
  return (
    <div className="po-lens">
      <div className="po-lens-head">{title}</div>
      <ul className="po-metrics">
        {metrics.map((m) => {
          const [head, ...rest] = m.label.split('·');
          return (
            <li className="po-metric" key={m.key} title={m.label}>
              <span className="po-m-label">{head.trim()}</span>
              {rest.length > 0 && <span className="po-m-note">{rest.join('·').trim()}</span>}
              <span className="po-m-val num">{m.display}</span>
              <MetricTrend metric={m} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Product outcomes own the full bottom row: two recognised metric lenses (the PIRATE
// funnel + HEART experience quality), the customer's own voice as a Cynefin sense-making
// triad, and the demand still open (unserved jobs). All skimmable without clicking.
export function OutcomesReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const { aarrr, heart, customerTriad, jobs } = OUTCOMES_SIGNAL.value;
  const ranked = [...jobs].sort((a, b) => a.rank - b.rank).slice(0, 3);
  const now = leanIndex(customerTriad, 'current');
  const before = leanIndex(customerTriad, 'prior');
  const drifted = now !== before;

  return (
    <Instrument
      label="Product outcomes"
      sub="AARRR · HEART · customer sense-making · unserved customer jobs"
      area="outcomes"
      onExpand={() => setDetail('outcomes')}
    >
      <div className="po">
        <Lens title="Acquisition → Revenue · AARRR" metrics={aarrr} />
        <Lens title="Experience · HEART" metrics={heart} />
        <div className="po-triad">
          <div className="po-lens-head">Customer sense-making</div>
          <div className="po-triad-chart">
            <TriadChart triad={customerTriad} showStory={false} />
          </div>
          <p className="po-triad-finding">
            leans <strong>“{customerTriad.poles[now].short}”</strong>
            {drifted && <> · drifted from “{customerTriad.poles[before].short}”</>}
          </p>
        </div>
        <div className="po-jobs">
          <div className="po-lens-head">Unserved customer jobs · prioritised</div>
          <ol className="po-job-list">
            {ranked.map((j) => (
              <li className="po-job" key={j.id}>
                <span className="po-rank">{j.rank}</span>
                <span className="po-job-text">{j.job}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Instrument>
  );
}
