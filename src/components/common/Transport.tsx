import type { TimeTravel } from './useTimeTravel';

const SPEEDS = [0.5, 1, 2, 4];

// The shared movie transport: play/pause, a scrubber, speeds, and the "as-of" label of the
// frame on screen. Used by Flow and the triad / radar time-travel views, so they all carry
// the same controls.
export function Transport({
  tt,
  label,
  speeds = SPEEDS,
}: {
  tt: TimeTravel;
  label: string;
  speeds?: number[];
}) {
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
    </div>
  );
}
