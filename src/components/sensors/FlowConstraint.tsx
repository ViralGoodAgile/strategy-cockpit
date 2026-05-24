import { useEffect, useState } from 'react';
import type { Signal } from '../../domain/types';
import type { FlowConstraintData } from '../../domain/sensors';
import { SensorModule } from './SensorModule';
import { FlowBoard, FlowLegend } from './FlowBoard';

// Flow.Constraint — an item-level "movie" of work moving through the system. Each
// station shows queued vs active work; tiles are coloured by type. The constraint is
// the station whose queue piles up; play/scrub to watch it shift. Motion carries meaning.
export function FlowConstraint({ signal }: { signal: Signal<FlowConstraintData> }) {
  const { frames, caps } = signal.value;
  const last = frames.length - 1;
  const [week, setWeek] = useState(0);
  const [playing, setPlaying] = useState(true); // auto-play the movie when opened
  const [speed, setSpeed] = useState(1); // playback multiplier

  // The movie: advance a frame every (1100 / speed) ms while playing; loop at the end.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setWeek((w) => (w >= last ? 0 : w + 1)), 1100 / speed);
    return () => clearInterval(id);
  }, [playing, last, speed]);

  const SPEEDS = [0.5, 1, 2, 4];

  const f = frames[week];
  const constraintName = f.constraint === 'review' ? 'Review' : 'Build';
  const constraintQ = f[f.constraint].queue.length;
  const shipped = week === 0 ? f.done.length : f.done.length - frames[week - 1].done.length;
  const moved = week > 0 && frames[week - 1].constraint !== f.constraint;

  return (
    <SensorModule
      name="Flow.Constraint"
      number={4}
      maps={signal.value.maps}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={
        <>
          {f.label}: the constraint is <strong>{constraintName}</strong> — {constraintQ} item
          {constraintQ === 1 ? '' : 's'} queued behind it. {moved && <>It just moved here. </>}
          Throughput holds at ~{shipped}/wk: the constraint, not effort, sets the pace.
        </>
      }
    >
      <div className="fi">
        <FlowBoard frame={f} caps={caps} />
        <FlowLegend />
        <div className="toc-player">
          <button className="toc-play" onClick={() => setPlaying((p) => !p)}>
            {playing ? '❚❚ pause' : '▶ play'}
          </button>
          <input
            className="toc-scrub"
            type="range"
            min={0}
            max={last}
            value={week}
            onChange={(e) => {
              setPlaying(false);
              setWeek(Number(e.target.value));
            }}
          />
          <div className="toc-speeds">
            {SPEEDS.map((sp) => (
              <button
                key={sp}
                className={`toc-speed ${speed === sp ? 'toc-speed-on' : ''}`}
                onClick={() => setSpeed(sp)}
              >
                {sp}×
              </button>
            ))}
          </div>
          <span className="toc-week">{f.label}</span>
        </div>
      </div>
    </SensorModule>
  );
}
