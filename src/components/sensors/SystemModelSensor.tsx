import type { Signal } from '../../domain/types';
import type { SystemModel } from '../../domain/sensors';
import { useCockpit } from '../../store/useCockpit';
import { SensorModule } from './SensorModule';
import { SystemModelCLD } from './SystemModelCLD';

// SystemModel.AutoGen — five seed CLDs, switchable. Each is a seed for dialogue, NOT a
// finding; promoting an arrow to causation needs a named person's written reasoning (C5).
export function SystemModelSensor({ signal }: { signal: Signal<SystemModel[]> }) {
  const models = signal.value;
  const index = useCockpit((s) => s.systemModelIndex);
  const setIndex = useCockpit((s) => s.setSystemModelIndex);
  const model = models[index];

  return (
    <SensorModule
      name="System Model"
      number={9}
      maps={model.maps}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={
        <>
          <strong>{model.note}</strong> A seed for dialogue, not a finding — every arrow defaults to
          correlation; causation needs a named person’s reasoning.
        </>
      }
    >
      <div className="sm-switch">
        {models.map((m, i) => (
          <button
            key={m.name}
            className={`sm-tab ${i === index ? 'sm-tab-on' : ''}`}
            onClick={() => setIndex(i)}
          >
            {m.name}
          </button>
        ))}
      </div>

      <SystemModelCLD model={model} detailed />

      <div className="cld-legend">
        <span><i className="cld-key cld-key-cause" /> causation</span>
        <span><i className="cld-key cld-key-corr" /> correlation</span>
        <span><i className="cld-key cld-key-hyp" /> hypothesis</span>
        <span className="cld-legend-note">R reinforcing · B balancing · + same · − opposite</span>
      </div>
    </SensorModule>
  );
}
