import type { Signal } from '../../domain/types';
import type { DoraSet } from '../../domain/sensors';
import { metricAt } from '../common/trend';
import { Numeral } from '../common/Numeral';
import { SensorModule } from './SensorModule';

// DORA.Metrics: the four numbers as focal numerals, lead-and-lag balanced. Movement is shown;
// no good/bad colouring — trends, not targets. `atIndex` reads the values as of a period (for
// the Quant time-travel movie); omitted, they read current.
export function DoraSensor({ signal, atIndex }: { signal: Signal<DoraSet>; atIndex?: number }) {
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
        {dora.metrics.map((m) => {
          const a = metricAt(m, atIndex ?? m.series.length - 1);
          return <Numeral key={m.key} value={a.display} label={m.label} metric={a} />;
        })}
      </div>
    </SensorModule>
  );
}
