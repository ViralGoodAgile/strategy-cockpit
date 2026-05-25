import { OUTCOMES_SIGNAL, RELIABILITY_SIGNAL, WEAK_SIGNAL, FLOW_SIGNAL } from '../../data/sensorData';
import { MANDATE_SIGNAL, actualMedian } from '../../data/synthetic';
import { levelGap } from '../../domain/mandate';
import { valueAreas, type Direction } from '../../mirrors/ebm';

const ARROW: Record<Direction, string> = { improving: '↑', worsening: '↓', flat: '·' };

// EBM — Value: the cockpit's signals read as Evidence-Based Management's four Key Value Areas
// (Scrum.org). Outcomes over output; each measure leads with direction of travel — the trend
// across its whole run, never a target. Assembled from existing sensors, so it stays honest.
export function EbmSensor() {
  const teams = MANDATE_SIGNAL.value;
  const gaps = teams
    .map((t) => {
      const m = actualMedian(t);
      return m ? Math.abs(levelGap(t.authorised, m)) : 0;
    })
    .sort((a, b) => a - b);
  const medianGap = gaps.length ? gaps[Math.floor((gaps.length - 1) / 2)] : 0;

  const areas = valueAreas({
    currentValue: OUTCOMES_SIGNAL.value.heart,
    timeToMarket: RELIABILITY_SIGNAL.value.metrics,
    throughput: FLOW_SIGNAL.value.throughputSeries,
    unservedJobs: OUTCOMES_SIGNAL.value.jobs.length,
    weakSignals: WEAK_SIGNAL.value.signals.length,
    mandateMedianGap: medianGap,
  });

  return (
    <div className="ebm">
      <p className="ebm-lead">
        Evidence-Based Management reads <strong>value, not output</strong>, across four Key Value
        Areas. Each measure leads with its direction of travel — the trend, never a target — drawn
        from the cockpit's own sensors.
      </p>
      <div className="ebm-grid">
        {areas.map((a) => (
          <div className="ebm-area" key={a.id}>
            <div className="ebm-area-head">
              <span className="ebm-kva">{a.id}</span> {a.name}
            </div>
            <p className="ebm-gist">{a.gist}</p>
            <ul className="ebm-measures">
              {a.measures.map((m, i) => (
                <li key={i} className={`ebm-measure ebm-${m.direction}`}>
                  <span className="ebm-arrow" aria-hidden>
                    {ARROW[m.direction]}
                  </span>
                  <span className="ebm-m-label">{m.label}</span>
                  <span className="ebm-m-detail">{m.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
