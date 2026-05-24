import { WEAK_SIGNAL } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { Instrument } from './Instrument';

// Glanceable weak-signals readout: the top role-level anomalies. Expand for the full set.
export function WeakSignalsReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const signals = WEAK_SIGNAL.value.signals;
  const rising = signals.filter((s) => s.rising).length;

  return (
    <Instrument
      label="Weak signals"
      sub={`${signals.length} · roles only`}
      area="weak"
      live={rising > 0}
      onExpand={() => setDetail('weak')}
    >
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
    </Instrument>
  );
}
