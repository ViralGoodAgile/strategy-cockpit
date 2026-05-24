import type { Signal } from '../../domain/types';
import type { Impediment, RadarSet, ScopeLevel } from '../../domain/sensors';
import { SensorModule } from './SensorModule';
import { RadarScope } from './RadarScope';

const LEVELS: { level: ScopeLevel; label: string }[] = [
  { level: 'pod', label: 'Pod' },
  { level: 'function', label: 'Function' },
  { level: 'org', label: 'Org' },
  { level: 'superorg', label: 'Super-org (outside)' },
];

// Radar.Impediments — blockers ranged by scope, like a ship's radar. Center is the
// most local (pod); the outer edge is outside the organisation (super-org).
export function RadarSensor({ signal }: { signal: Signal<RadarSet> }) {
  const items = signal.value.impediments;
  const byLevel = (l: ScopeLevel): Impediment[] => items.filter((i) => i.level === l);
  const high = items.filter((i) => i.severity === 'high').length;

  return (
    <SensorModule
      name="Radar — Impediments"
      number={10}
      maps={signal.value.maps}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={
        <>
          {items.length} impediments on the scope, {high} high-severity. Ranged by reach: center is
          local (a pod), the outer ring is outside the organisation. Scopes only, never named people.
        </>
      }
    >
      <div className="radar-detail">
        <RadarScope set={signal.value} />
        <div className="radar-legend">
          {LEVELS.map((lv) => (
            <div className="radar-grp" key={lv.level}>
              <div className="radar-grp-head">{lv.label}</div>
              {byLevel(lv.level).map((im) => (
                <div className="radar-grp-row" key={im.id}>
                  <span className={`radar-pip radar-${im.severity}`} />
                  {im.label}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </SensorModule>
  );
}
