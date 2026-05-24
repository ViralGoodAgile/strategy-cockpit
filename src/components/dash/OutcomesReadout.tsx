import { OUTCOMES_SIGNAL } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { Numeral, metricTrend } from '../common/Numeral';
import { Instrument } from './Instrument';

// Production outcomes — changes in product metrics + telemetry. The reality the loop
// senses (is the world moving toward intent?). Expand for the full set.
export function OutcomesReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const metrics = OUTCOMES_SIGNAL.value.metrics.slice(0, 4);

  return (
    <Instrument label="Production outcomes" sub="product metrics · telemetry" area="outcomes" onExpand={() => setDetail('outcomes')}>
      <div className="quant-grid">
        {metrics.map((m) => (
          <Numeral key={m.key} value={m.display} label={m.label} trend={metricTrend(m)} />
        ))}
      </div>
    </Instrument>
  );
}
