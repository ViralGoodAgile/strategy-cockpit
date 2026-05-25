import type { Signal } from '../../domain/types';
import type { SystemModel } from '../../domain/sensors';
import { useCockpit } from '../../store/useCockpit';
import { offsetFromNow } from '../../mirrors/snapshotHistory';
import { systemModelAt } from '../../mirrors/systemModelHistory';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { useTimeTravel } from '../common/useTimeTravel';
import { Transport } from '../common/Transport';
import { SensorModule } from './SensorModule';
import { SystemModelCLD } from './SystemModelCLD';

// SystemModel.AutoGen — five seed CLDs, switchable and travellable: a model is a living seed,
// so scrub or play to watch links get drawn, re-routed and harden from hypothesis toward
// causation. Each is a seed for dialogue, NOT a finding; promoting an arrow to causation needs
// a named person's written reasoning (C5).
export function SystemModelSensor({ signal }: { signal: Signal<SystemModel[]> }) {
  const models = signal.value;
  const index = useCockpit((s) => s.systemModelIndex);
  const setIndex = useCockpit((s) => s.setSystemModelIndex);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const tt = useTimeTravel(PERIODS);
  const asOf = periodLabel(offsetFromNow(tt.index, tt.last), timeUnit);
  const base = models[index];
  const model = systemModelAt(base, offsetFromNow(tt.index, tt.last), tt.last);

  return (
    <SensorModule
      name="System Model"
      number={9}
      maps={base.maps}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={
        <>
          <strong>{base.note}</strong> A living seed for dialogue, not a finding — <strong>{asOf}</strong>:{' '}
          {model.links.length} links. Every arrow defaults to correlation; causation needs a named
          person’s reasoning.
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

      <Transport tt={tt} label={asOf} granularity />

      <div className="cld-legend">
        <span><i className="cld-key cld-key-cause" /> causation</span>
        <span><i className="cld-key cld-key-corr" /> correlation</span>
        <span><i className="cld-key cld-key-hyp" /> hypothesis</span>
        <span className="cld-legend-note">R reinforcing · B balancing · + same · − opposite</span>
      </div>
    </SensorModule>
  );
}
