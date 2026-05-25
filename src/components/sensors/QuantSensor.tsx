import { DATADOG_SIGNAL, DORA_SIGNAL } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { useTimeTravel } from '../common/useTimeTravel';
import { Transport } from '../common/Transport';
import { DoraSensor } from './DoraSensor';
import { DataDogSensor } from './DataDogSensor';

// The Quant overlay: DORA + DataDog as one time-travel movie. A single transport scrubs both
// sensors together, so every number reads "as of" the same period. Its own transport overrides
// the dashboard's global as-of (travel within the widget wins once it's open).
export function QuantSensor() {
  const timeUnit = useCockpit((s) => s.timeUnit);
  const tt = useTimeTravel(PERIODS);
  const asOf = periodLabel(tt.last - tt.index, timeUnit);

  return (
    <div className="quant-detail">
      <Transport tt={tt} label={asOf} granularity />
      <div className="overlay-stack">
        <DoraSensor signal={DORA_SIGNAL} atIndex={tt.index} />
        <DataDogSensor signal={DATADOG_SIGNAL} atIndex={tt.index} />
      </div>
    </div>
  );
}
