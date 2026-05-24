import { SYSTEM_MODEL_SIGNAL } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { SystemModelCLD } from '../sensors/SystemModelCLD';
import { Instrument } from './Instrument';

// Glanceable system-model readout: the selected seed CLD. Expand to switch among the five.
export function SystemModelReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const index = useCockpit((s) => s.systemModelIndex);
  const models = SYSTEM_MODEL_SIGNAL.value;
  const model = models[index];

  return (
    <Instrument
      label="System model"
      sub={`${index + 1}/${models.length} ›`}
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
