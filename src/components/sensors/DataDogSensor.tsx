import type { Signal } from '../../domain/types';
import type { DataDogSet } from '../../domain/sensors';
import { Numeral } from '../common/Numeral';
import { SensorModule } from './SensorModule';

// DataDog.Ingest: production observability, explicitly a LAG source. Freshest of the
// sensors — reality arrives here first, strategy last.
export function DataDogSensor({ signal }: { signal: Signal<DataDogSet> }) {
  const dd = signal.value;
  return (
    <SensorModule
      name="DataDog.Ingest"
      number={7}
      maps={dd.maps}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={<>Lag source — production as it is now. The freshest signal in the cockpit; INTENT is the slowest to catch up.</>}
    >
      <div className="dd-row">
        <span className="dd-tag">lag</span>
        <div className="dora-grid">
          {dd.metrics.map((m) => (
            <Numeral key={m.key} value={m.display} label={m.label} metric={m} />
          ))}
        </div>
      </div>
    </SensorModule>
  );
}
