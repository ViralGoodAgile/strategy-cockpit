import { SYSTEM_MODEL_SIGNAL } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { offsetFromNow } from '../../mirrors/snapshotHistory';
import { systemModelAt } from '../../mirrors/systemModelHistory';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { SystemModelCLD } from '../sensors/SystemModelCLD';
import { Instrument } from './Instrument';

// Glanceable system-model readout: the selected seed CLD as a LIVING model — links are drawn,
// re-routed and dropped over time, so it carries the dashboard's as-of (fewer, softer links
// earlier). Expand to switch among the five and scrub the model's evolution.
export function SystemModelReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const index = useCockpit((s) => s.systemModelIndex);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const timeIndex = useCockpit((s) => s.timeIndex);
  const models = SYSTEM_MODEL_SIGNAL.value;
  const offset = offsetFromNow(timeIndex, PERIODS - 1);
  const model = systemModelAt(models[index], offset, PERIODS - 1);
  const asOf = periodLabel(offset, timeUnit);

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
