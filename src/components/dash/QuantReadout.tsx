import { DATADOG_SIGNAL, DORA_SIGNAL } from '../../data/sensorData';
import type { Metric } from '../../domain/sensors';
import { useCockpit } from '../../store/useCockpit';
import { Numeral, metricTrend } from '../common/Numeral';
import { Instrument } from './Instrument';

// Quant cluster — DORA (lead/lag) plus a DataDog lag reading, as glowing numerals.
// Expand for the full DORA + DataDog sensors.
export function QuantReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const dora = DORA_SIGNAL.value.metrics;
  const lag = DATADOG_SIGNAL.value.metrics.filter((m) => m.key === 'uptime' || m.key === 'errorRate');
  const shown: Metric[] = [...dora, ...lag];

  return (
    <Instrument label="Quant" sub="DORA · DataDog" area="quant" onExpand={() => setDetail('quant')}>
      <div className="quant-grid">
        {shown.map((m) => (
          <Numeral key={m.key} value={m.display} label={m.label} trend={metricTrend(m)} />
        ))}
      </div>
    </Instrument>
  );
}
