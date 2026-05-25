import { RADAR_SIGNAL } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { radarHistory } from '../../mirrors/radarHistory';
import { PERIODS } from '../../lib/timeTravel';
import { RadarScope } from '../sensors/RadarScope';
import { Instrument } from './Instrument';

// Glanceable radar readout: the scope with blips, at the dashboard's global as-of. Expand
// for the full movie + impediment list.
export function RadarReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const timeIndex = useCockpit((s) => s.timeIndex);

  const snap = radarHistory(RADAR_SIGNAL.value, PERIODS, timeUnit)[timeIndex];
  const high = snap.set.impediments.filter((i) => i.severity === 'high').length;

  return (
    <Instrument
      label="Radar"
      sub={`${high} high · ${snap.label}`}
      area="radar"
      live={high > 0}
      onExpand={() => setDetail('radar')}
    >
      <div className="radar-read">
        <RadarScope set={snap.set} />
      </div>
    </Instrument>
  );
}
