import { useCockpit } from '../../store/useCockpit';
import { TIME_UNITS, unitLabel, type TimeUnit } from '../../lib/timeTravel';
import type { TimeTravel } from './useTimeTravel';

const SPEEDS = [0.5, 1, 2, 4];

// The shared movie transport: play/pause, a scrubber, speeds, and the "as-of" label of the
// frame on screen. With `granularity`, it also offers the weeks…years chooser (bound to the
// dashboard-wide unit), so the granularity is configurable inside each widget, not only the HUD.
export function Transport({
  tt,
  label,
  speeds = SPEEDS,
  granularity = false,
}: {
  tt: TimeTravel;
  label: string;
  speeds?: number[];
  granularity?: boolean;
}) {
  const timeUnit = useCockpit((s) => s.timeUnit);
  const setTimeUnit = useCockpit((s) => s.setTimeUnit);

  return (
    <div className="toc-player">
      <button className="toc-play" onClick={() => tt.setPlaying(!tt.playing)}>
        {tt.playing ? '❚❚ pause' : '▶ play'}
      </button>
      <input
        className="toc-scrub"
        type="range"
        min={0}
        max={tt.last}
        value={tt.index}
        aria-label="scrub through time"
        onChange={(e) => tt.setIndex(Number(e.target.value))}
      />
      <div className="toc-speeds">
        {speeds.map((sp) => (
          <button
            key={sp}
            className={`toc-speed ${tt.speed === sp ? 'toc-speed-on' : ''}`}
            onClick={() => tt.setSpeed(sp)}
          >
            {sp}×
          </button>
        ))}
      </div>
      <span className="toc-asof">{label}</span>
      {granularity && (
        <select
          className="toc-unit"
          value={timeUnit}
          aria-label="time granularity"
          onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
        >
          {TIME_UNITS.map((u) => (
            <option key={u} value={u}>
              {unitLabel(u)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
