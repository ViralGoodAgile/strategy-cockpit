import { RELIABILITY_SIGNAL } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { metricAt } from '../common/trend';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { Numeral } from '../common/Numeral';
import { Instrument } from './Instrument';

// Reliability — the production/operational subset of product outcomes. Uptime, MTTR,
// incidents, error rate, read at the dashboard's global as-of as trend (not an SLA
// pass/fail). Glances live if any measure is moving the wrong way.
export function ReliabilityReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const timeIndex = useCockpit((s) => s.timeIndex);

  const metrics = RELIABILITY_SIGNAL.value.metrics.map((m) => metricAt(m, timeIndex));
  const regressing = metrics.some((m) =>
    m.better === 'higher' ? m.value < m.prior : m.value > m.prior,
  );
  const asOf = periodLabel(PERIODS - 1 - timeIndex, timeUnit);

  return (
    <Instrument
      label="Reliability"
      sub={`production subset · ${asOf}`}
      area="reliability"
      live={regressing}
      onExpand={() => setDetail('reliability')}
    >
      <div className="quant-grid">
        {metrics.map((m) => (
          <Numeral key={m.key} value={m.display} label={m.label} metric={m} />
        ))}
      </div>
    </Instrument>
  );
}
