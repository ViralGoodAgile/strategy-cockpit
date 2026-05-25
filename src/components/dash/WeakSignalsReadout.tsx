import { WEAK_SIGNAL } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { offsetFromNow, weakSignalsAt } from '../../mirrors/snapshotHistory';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { Instrument } from './Instrument';

// Glanceable weak-signals readout: the top role-level anomalies, as of the dashboard's
// global as-of (weak signals emerge over time, so fewer show earlier). Expand for the full set.
export function WeakSignalsReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const timeIndex = useCockpit((s) => s.timeIndex);

  const offset = offsetFromNow(timeIndex, PERIODS - 1);
  const asOf = periodLabel(offset, timeUnit);
  const signals = weakSignalsAt(WEAK_SIGNAL.value.signals, offset);
  const rising = signals.filter((s) => s.rising).length;

  return (
    <Instrument
      label="Weak signals"
      sub={`${signals.length} · ${asOf}`}
      area="weak"
      live={rising > 0}
      onExpand={() => setDetail('weak')}
    >
      {signals.length === 0 ? (
        <p className="ws-empty">none surfaced yet</p>
      ) : (
        <ul className="ws-read">
          {signals.slice(0, 3).map((s) => (
            <li key={s.id} className="ws-read-row">
              <span className={`ws-pip ${s.rising ? 'ws-rising' : ''}`} />
              <span className="ws-read-text">
                <strong>{s.role}</strong> {s.behaviour}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Instrument>
  );
}
