import { RELIABILITY_SIGNAL } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { Numeral } from '../common/Numeral';
import { Instrument } from './Instrument';

// Reliability — the production/operational subset of product outcomes. Uptime, MTTR,
// incidents, error rate, shown as trend (not an SLA pass/fail). Glances live if any
// measure is moving the wrong way.
export function ReliabilityReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const { metrics } = RELIABILITY_SIGNAL.value;
  const regressing = metrics.some((m) =>
    m.better === 'higher' ? m.value < m.prior : m.value > m.prior,
  );

  return (
    <Instrument
      label="Reliability"
      sub="production subset"
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
