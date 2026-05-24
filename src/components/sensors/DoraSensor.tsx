import type { Signal } from '../../domain/types';
import type { DoraSet } from '../../domain/sensors';
import { Numeral } from '../common/Numeral';
import { SensorModule } from './SensorModule';

// DORA.Metrics: the four numbers as focal numerals, lead-and-lag balanced. Movement
// is shown; no good/bad colouring — trends, not targets.
export function DoraSensor({ signal }: { signal: Signal<DoraSet> }) {
  const dora = signal.value;
  return (
    <SensorModule
      name="DORA.Metrics"
      number={6}
      maps={dora.maps}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={<>Lead and lag together: faster deploys, lead time edging up. Watch the pair, not one.</>}
    >
      <div className="dora-grid">
        {dora.metrics.map((m) => (
          <Numeral key={m.key} value={m.display} label={m.label} metric={m} />
        ))}
      </div>
    </SensorModule>
  );
}
