import type { Signal } from '../../domain/types';
import type { ReliabilitySet } from '../../domain/sensors';
import { useCockpit } from '../../store/useCockpit';
import { metricAt } from '../common/trend';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { useTimeTravel } from '../common/useTimeTravel';
import { Transport } from '../common/Transport';
import { Numeral } from '../common/Numeral';
import { SensorModule } from './SensorModule';

// Reliability — the production/operational SUBSET of product outcomes, as a time-travel
// movie. Does the product stay up and recover fast? Read as direction of travel (MTTR
// 52m → 38m), never an SLA pass/fail badge. Its own transport overrides the global as-of.
export function ReliabilitySensor({ signal }: { signal: Signal<ReliabilitySet> }) {
  const timeUnit = useCockpit((s) => s.timeUnit);
  const tt = useTimeTravel(PERIODS);
  const asOf = periodLabel(tt.last - tt.index, timeUnit);

  return (
    <SensorModule
      name="Reliability"
      number={12}
      maps={signal.value.maps}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={
        <>
          <strong>{asOf}</strong>: the production / operational subset of product outcomes. Uptime
          and MTTR improve together — recovery gets faster as incidents fall. Shown as trend, not a
          target: a green SLA can still be sliding the wrong way. Scrub or play to travel.
        </>
      }
    >
      <Transport tt={tt} label={asOf} granularity />
      <div className="outcomes-grid">
        {signal.value.metrics.map((m) => {
          const a = metricAt(m, tt.index);
          return <Numeral key={m.key} value={a.display} label={m.label} metric={a} />;
        })}
      </div>
    </SensorModule>
  );
}
