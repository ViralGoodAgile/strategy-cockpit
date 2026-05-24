import type { Signal } from '../../domain/types';
import type { ReliabilitySet } from '../../domain/sensors';
import { Numeral } from '../common/Numeral';
import { SensorModule } from './SensorModule';

// Reliability — the production/operational SUBSET of product outcomes. Does the product
// stay up and recover fast? Read as direction of travel (MTTR 52m → 38m), never an SLA
// pass/fail badge — the cockpit inspects the trend.
export function ReliabilitySensor({ signal }: { signal: Signal<ReliabilitySet> }) {
  return (
    <SensorModule
      name="Reliability"
      number={12}
      maps={signal.value.maps}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={
        <>
          The production / operational subset of product outcomes. Uptime and MTTR are
          improving together — recovery is getting faster as incidents fall. Shown as trend,
          not a target: a green SLA can still be sliding the wrong way.
        </>
      }
    >
      <div className="outcomes-grid">
        {signal.value.metrics.map((m) => (
          <Numeral key={m.key} value={m.display} label={m.label} metric={m} />
        ))}
      </div>
    </SensorModule>
  );
}
