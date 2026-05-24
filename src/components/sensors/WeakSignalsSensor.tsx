import type { Signal } from '../../domain/types';
import type { WeakSignalSet } from '../../domain/sensors';
import { SensorModule } from './SensorModule';

// WeakSignal.Detector — behavioural anomalies below routine reporting. Role-level
// only; never named individuals (C4). A weak signal may precede a regime shift.
export function WeakSignalsSensor({ signal }: { signal: Signal<WeakSignalSet> }) {
  const signals = signal.value.signals;
  return (
    <SensorModule
      name="Weak Signals"
      number={2}
      maps={signal.value.maps}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={
        <>
          {signals.length} behavioural anomalies, below the threshold of routine reporting. Roles and
          patterns only — never named people. A weak signal may precede a regime shift, or be noise.
        </>
      }
    >
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
    </SensorModule>
  );
}
