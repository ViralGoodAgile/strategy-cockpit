import { useEffect, useState } from 'react';
import { useCockpit } from '../../store/useCockpit';
import { PERIODS, TIME_UNITS, periodLabel, unitLabel, type TimeUnit } from '../../lib/timeTravel';

// The dashboard-wide time-travel control, kept to a compact HUD chip (so it costs no grid
// height): the chip shows the global "as-of", and clicking it opens a small panel to set the
// granularity (weeks … years), scrub, or play. Every travel-capable widget reflects the
// global as-of on its tile; opening a widget hands control to that widget's own transport.
export function GlobalTimeTravel() {
  const timeUnit = useCockpit((s) => s.timeUnit);
  const timeIndex = useCockpit((s) => s.timeIndex);
  const setTimeUnit = useCockpit((s) => s.setTimeUnit);
  const setTimeIndex = useCockpit((s) => s.setTimeIndex);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const last = PERIODS - 1;
  const asOf = periodLabel(last - timeIndex, timeUnit);

  // Play the whole dashboard forward through time (read latest from the store each tick).
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const i = useCockpit.getState().timeIndex;
      useCockpit.getState().setTimeIndex(i >= last ? 0 : i + 1);
    }, 1400);
    return () => clearInterval(id);
  }, [playing, last]);

  return (
    <div className="hud-time">
      <button
        className={`hud-time-chip${timeIndex !== last ? ' hud-time-chip-on' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title="time-travel the whole dashboard"
      >
        as of {asOf} ▾
      </button>
      {open && (
        <>
          <div className="hud-time-backdrop" onClick={() => setOpen(false)} />
          <div className="hud-time-pop">
            <div className="gt-row">
              <button
                className="gt-play"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? 'pause' : 'play'}
              >
                {playing ? '❚❚' : '▶'}
              </button>
              <input
                className="gt-scrub"
                type="range"
                min={0}
                max={last}
                value={timeIndex}
                aria-label="dashboard as-of"
                onChange={(e) => {
                  setPlaying(false);
                  setTimeIndex(Number(e.target.value));
                }}
              />
              <span className="gt-asof">{asOf}</span>
            </div>
            <label className="gt-row gt-unit-row">
              <span className="gt-unit-tag">granularity</span>
              <select
                className="gt-unit"
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
            </label>
          </div>
        </>
      )}
    </div>
  );
}
