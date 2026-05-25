import { useState } from 'react';
import type { Signal } from '../../domain/types';
import type { FlowConstraintData } from '../../domain/sensors';
import { backlogClass } from '../../domain/sensors';
import { BACKLOG } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { frameForPeriod, periodLabel } from '../../lib/timeTravel';
import { offsetFromNow } from '../../mirrors/snapshotHistory';
import { Transport } from '../common/Transport';
import { useGlobalTime } from '../common/useGlobalTime';
import { SensorModule } from './SensorModule';
import { FlowBoard, FlowLegend } from './FlowBoard';

// Median of a number list.
function median(xs: number[]): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor((s.length - 1) / 2);
  return s.length % 2 ? s[m] : Math.round((s[m] + s[m + 1]) / 2);
}

// Backlog pruning: zombies/fossils inflate age-in-state and make a WIP cap meaningless.
// Surfaces them, lets you prune, and shows the metric impact — pruning is the team's call.
function BacklogPanel() {
  const [pruned, setPruned] = useState(false);
  const items = BACKLOG.items;
  const live = items.filter((i) => backlogClass(i.age) === 'live');
  const zombie = items.filter((i) => backlogClass(i.age) === 'zombie');
  const fossil = items.filter((i) => backlogClass(i.age) === 'fossil');
  const shown = pruned ? live : items;
  const ageAll = median(items.map((i) => i.age));
  const ageLive = median(live.map((i) => i.age));

  return (
    <div className="bk">
      <div className="bk-head">
        <span className="bk-title">Backlog</span>
        <span className="bk-counts">
          {items.length} items · {live.length} live · <span className="bk-z">{zombie.length} zombie</span> ·{' '}
          <span className="bk-f">{fossil.length} fossil</span>
        </span>
        <button className="bk-prune" onClick={() => setPruned((p) => !p)}>
          {pruned ? 'show all' : 'prune zombies + fossils'}
        </button>
      </div>
      <div className="bk-tiles">
        {shown.map((i) => {
          const c = backlogClass(i.age);
          return <span key={i.id} className={`fi-tile fi-${i.type} bk-${c}`} title={`${i.id} · ${i.type} · ${i.age}d untouched`} />;
        })}
      </div>
      <p className="bk-note">
        {pruned ? (
          <>
            {zombie.length + fossil.length} excluded · age-in-state <span className="num">{ageAll}d</span> →{' '}
            <span className="num">{ageLive}d</span>. Flow metrics now run on live work only.
          </>
        ) : (
          <>
            Zombies inflate age-in-state to <span className="num">{ageAll}d</span> (live work is{' '}
            <span className="num">{ageLive}d</span>). A WIP cap is meaningless over a graveyard.
          </>
        )}
      </p>
    </div>
  );
}

// Flow.Constraint — an item-level "movie" of work moving through the system. Each
// station shows queued vs active work; tiles are coloured by type. The constraint is
// the station whose queue piles up; play/scrub to watch it shift. Motion carries meaning.
export function FlowConstraint({ signal }: { signal: Signal<FlowConstraintData> }) {
  const { frames, caps } = signal.value;
  const timeUnit = useCockpit((s) => s.timeUnit);
  const tt = useGlobalTime();
  const asOf = periodLabel(offsetFromNow(tt.index, tt.last), timeUnit);
  // the flow sim runs at a finer cadence than the global periods — project the period onto a frame
  const week = frameForPeriod(tt.index, tt.last, frames.length);
  const prevWeek = frameForPeriod(tt.index - 1, tt.last, frames.length);

  const f = frames[week];
  const constraintName = f.constraint === 'review' ? 'Review' : 'Build';
  const constraintQ = f[f.constraint].queue.length;
  const shipped = tt.index === 0 ? f.done.length : f.done.length - frames[prevWeek].done.length;
  const moved = tt.index > 0 && frames[prevWeek].constraint !== f.constraint;

  return (
    <SensorModule
      name="Flow.Constraint"
      number={4}
      maps={signal.value.maps}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={
        <>
          <strong>{asOf}</strong> · {f.label}: the constraint is <strong>{constraintName}</strong> —{' '}
          {constraintQ} item{constraintQ === 1 ? '' : 's'} queued behind it.{' '}
          {moved && <>It just moved here. </>}
          Throughput holds at ~{shipped}/wk: the constraint, not effort, sets the pace.
        </>
      }
    >
      <div className="fi">
        <FlowBoard frame={f} caps={caps} />
        <FlowLegend />
        <Transport tt={tt} label={asOf} granularity />
        <BacklogPanel />
      </div>
    </SensorModule>
  );
}
