import type { Signal } from '../../domain/types';
import type { WeakSignalSet } from '../../domain/sensors';
import { useCockpit } from '../../store/useCockpit';
import { offsetFromNow, weakSignalsAt } from '../../mirrors/snapshotHistory';
import { periodLabel } from '../../lib/timeTravel';
import { useGlobalTime } from '../common/useGlobalTime';
import { Transport } from '../common/Transport';
import { SensorModule } from './SensorModule';

// WeakSignal.Detector — behavioural anomalies below routine reporting, as a time-travel
// movie: scrub or play to watch them surface over time. Role-level only; never named
// individuals (C4). Its own transport overrides the dashboard's global as-of.
export function WeakSignalsSensor({ signal }: { signal: Signal<WeakSignalSet> }) {
  const timeUnit = useCockpit((s) => s.timeUnit);
  const tt = useGlobalTime();
  const asOf = periodLabel(offsetFromNow(tt.index, tt.last), timeUnit);
  const signals = weakSignalsAt(signal.value.signals, offsetFromNow(tt.index, tt.last));

  return (
    <SensorModule
      name="Weak Signals"
      number={2}
      maps={signal.value.maps}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={
        <>
          <strong>{asOf}</strong>: {signals.length} behavioural anomalies, below the threshold of
          routine reporting. Roles and patterns only — never named people. A weak signal may precede
          a regime shift, or be noise. Scrub or play to watch them surface.
        </>
      }
    >
      <Transport tt={tt} label={asOf} granularity />
      {signals.length === 0 ? (
        <p className="ws-empty">none surfaced yet</p>
      ) : (
        <ul className="ws-list">
          {signals.map((s) => (
            <li className="ws-item" key={s.id}>
              <span className={`ws-pip ${s.rising ? 'ws-rising' : ''}`} />
              <span className="ws-text">
                The <strong>{s.role}</strong> role {s.behaviour}.
              </span>
              <span className="ws-since">{s.sinceWeeks}w{s.rising ? ' · rising' : ''}</span>
            </li>
          ))}
        </ul>
      )}
    </SensorModule>
  );
}
