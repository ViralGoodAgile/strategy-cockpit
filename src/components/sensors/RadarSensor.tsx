import { useMemo } from 'react';
import type { Signal } from '../../domain/types';
import type { Impediment, RadarSet, ScopeLevel } from '../../domain/sensors';
import { radarHistory } from '../../mirrors/radarHistory';
import { useTimeTravel } from '../common/useTimeTravel';
import { Transport } from '../common/Transport';
import { SensorModule } from './SensorModule';
import { RadarScope } from './RadarScope';

const LEVELS: { level: ScopeLevel; label: string }[] = [
  { level: 'pod', label: 'Pod' },
  { level: 'function', label: 'Function' },
  { level: 'org', label: 'Org' },
  { level: 'superorg', label: 'Super-org (outside)' },
];

// Radar.Impediments — blockers ranged by scope, like a ship's radar, as a time-travel
// movie: scrub or play to watch impediments emerge, escalate and resolve. Center is the
// most local (pod); the outer edge is outside the organisation (super-org).
export function RadarSensor({ signal }: { signal: Signal<RadarSet> }) {
  const snapshots = useMemo(() => radarHistory(signal.value), [signal.value]);
  const tt = useTimeTravel(snapshots.length);
  const snap = snapshots[tt.index];
  const items = snap.set.impediments;
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
          <strong>{snap.label}</strong>: {items.length} impediments on the scope, {high} high-severity.
          Ranged by reach: center is local (a pod), the outer ring is outside the organisation.
          Scrub or play to watch them emerge, escalate and resolve. Scopes only, never named people.
        </>
      }
    >
      <Transport tt={tt} label={snap.label} />
      <div className="radar-detail">
        <RadarScope set={snap.set} />
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
