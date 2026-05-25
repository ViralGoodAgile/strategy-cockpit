import { DATADOG_SIGNAL, DORA_SIGNAL } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { metricAt } from '../common/trend';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { Numeral } from '../common/Numeral';
import { Instrument } from './Instrument';

// Quant cluster — DORA (lead/lag) plus a DataDog lag reading, as glowing numerals, read at
// the dashboard's global as-of. Expand for the full DORA + DataDog sensors.
export function QuantReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const timeIndex = useCockpit((s) => s.timeIndex);

  // A 4-up lead/lag preview (deploy + lead time from DORA, uptime + error rate from
  // DataDog) — the densest tile can't hold all six at a glance; the full set is one click away.
  const dora = DORA_SIGNAL.value.metrics.filter((m) => m.key === 'deployFreq' || m.key === 'leadTime');
  const lag = DATADOG_SIGNAL.value.metrics.filter((m) => m.key === 'uptime' || m.key === 'errorRate');
  const shown = [...dora, ...lag].map((m) => metricAt(m, timeIndex));
  const asOf = periodLabel(PERIODS - 1 - timeIndex, timeUnit);

  return (
    <Instrument label="Quant" sub={`DORA · DataDog · ${asOf}`} area="quant" onExpand={() => setDetail('quant')}>
      <div className="quant-grid">
        {shown.map((m) => (
          <Numeral key={m.key} value={m.display} label={m.label} metric={m} />
        ))}
      </div>
    </Instrument>
  );
}
