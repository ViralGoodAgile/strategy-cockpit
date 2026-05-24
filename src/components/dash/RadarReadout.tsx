import { RADAR_SIGNAL } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { RadarScope } from '../sensors/RadarScope';
import { Instrument } from './Instrument';

// Glanceable radar readout: the scope with blips. Expand for the impediment list.
export function RadarReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const high = RADAR_SIGNAL.value.impediments.filter((i) => i.severity === 'high').length;

  return (
    <Instrument
      label="Radar"
      sub={`${high} high`}
      area="radar"
      live={high > 0}
      onExpand={() => setDetail('radar')}
    >
      <div className="radar-read">
        <RadarScope set={RADAR_SIGNAL.value} />
      </div>
    </Instrument>
  );
}
