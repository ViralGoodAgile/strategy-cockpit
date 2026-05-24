import { OUTCOMES_SIGNAL } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { Numeral, metricTrend } from '../common/Numeral';
import { Instrument } from './Instrument';

// Production outcomes own the full bottom row: the product-metric movements (supply —
// is the world moving toward intent?) beside the prioritised-but-unserved customer jobs
// (demand — what we've chosen to serve next). Both skimmable without clicking.
export function OutcomesReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const { metrics, jobs } = OUTCOMES_SIGNAL.value;
  const ranked = [...jobs].sort((a, b) => a.rank - b.rank);

  return (
    <Instrument
      label="Production outcomes"
      sub="product metrics · telemetry · unserved demand"
      area="outcomes"
      onExpand={() => setDetail('outcomes')}
    >
      <div className="orw">
        <div className="orw-metrics">
          {metrics.map((m) => (
            <Numeral key={m.key} value={m.display} label={m.label} trend={metricTrend(m)} />
          ))}
        </div>
        <div className="orw-jobs">
          <div className="orw-jobs-head">Unserved jobs · prioritised</div>
          <ol className="orw-job-list">
            {ranked.map((j) => (
              <li key={j.id} className="orw-job">
                <span className="orw-rank">{j.rank}</span>
                <span className="orw-job-text">{j.job}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Instrument>
  );
}
