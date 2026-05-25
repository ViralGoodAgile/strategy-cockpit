import { SYSTEM_MODEL_SIGNAL } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { offsetFromNow } from '../../mirrors/snapshotHistory';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { SystemModelCLD } from '../sensors/SystemModelCLD';
import { Instrument } from './Instrument';

// Glanceable system-model readout: the selected seed CLD. The structure is the team's
// authored model (it doesn't change period-to-period), so it carries the dashboard's as-of
// rather than a fabricated history. Expand to switch among the five.
export function SystemModelReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const index = useCockpit((s) => s.systemModelIndex);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const timeIndex = useCockpit((s) => s.timeIndex);
  const models = SYSTEM_MODEL_SIGNAL.value;
  const model = models[index];
  const asOf = periodLabel(offsetFromNow(timeIndex, PERIODS - 1), timeUnit);

  return (
    <Instrument
      label="System model"
      sub={`${index + 1}/${models.length} · ${asOf}`}
      area="system"
      onExpand={() => setDetail('system')}
    >
      <div className="sm-read">
        <SystemModelCLD model={model} />
      </div>
      <div className="sm-name">{model.name}</div>
    </Instrument>
  );
}
