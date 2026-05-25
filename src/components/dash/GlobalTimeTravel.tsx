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
  const playing = useCockpit((s) => s.timePlaying);
  const speed = useCockpit((s) => s.timeSpeed);
  const setTimeUnit = useCockpit((s) => s.setTimeUnit);
  const setTimeIndex = useCockpit((s) => s.setTimeIndex);
  const setPlaying = useCockpit((s) => s.setTimePlaying);
  const [open, setOpen] = useState(false);
  const last = PERIODS - 1;
  const asOf = periodLabel(last - timeIndex, timeUnit);

  // The ONE master clock: play the whole dashboard forward through time (read latest from the
  // store each tick). Every travel-capable widget reads timeIndex, so they all advance together.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const i = useCockpit.getState().timeIndex;
      useCockpit.getState().setTimeIndex(i >= last ? 0 : i + 1);
    }, 1400 / speed);
    return () => clearInterval(id);
  }, [playing, speed, last]);

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
                onClick={() => setPlaying(!playing)}
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
