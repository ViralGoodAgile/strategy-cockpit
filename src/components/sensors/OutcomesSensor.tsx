import type { Signal } from '../../domain/types';
import type { OutcomeSet } from '../../domain/sensors';
import { Numeral, metricTrend } from '../common/Numeral';
import { SensorModule } from './SensorModule';

// Production Outcomes — the full set of product-metric changes + usage telemetry. This
// is REALITY: the cockpit's evidence that the strategy is (or isn't) moving the world.
export function OutcomesSensor({ signal }: { signal: Signal<OutcomeSet> }) {
  return (
    <SensorModule
      name="Production Outcomes"
      number={11}
      maps={signal.value.maps}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={
        <>
          Changes in product metrics and usage telemetry — the REALITY the loop senses. Activation
          and habit are rising; the question for the loop is whether INTENT moves in response.
        </>
      }
    >
      <div className="outcomes-grid">
        {signal.value.metrics.map((m) => (
          <Numeral key={m.key} value={m.display} label={m.label} trend={metricTrend(m)} />
        ))}
      </div>
    </SensorModule>
  );
}
