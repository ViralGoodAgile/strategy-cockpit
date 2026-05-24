import type { Metric } from '../../domain/sensors';
import type { Trend } from '../../domain/types';
import { metricTrend, metricRunTrend } from './trend';

const GLYPH: Record<Trend['direction'], string> = {
  up: '↑',
  down: '↓',
  flat: '→',
  new: '·',
};

// Two marks for one metric:
//   • the prominent SIGNAL arrow — the fitted trend across the whole series (lead with this)
//   • a small LAST-POINT arrow — the two-point delta, kept secondary (it's tamperable)
// When the latest point disagrees with the signal, the wrapper is tagged so the eye can
// catch "the last bar moved the other way from the run".
export function MetricTrend({ metric }: { metric: Metric }) {
  const run = metricRunTrend(metric);
  const last = metricTrend(metric);
  const diverges =
    run.direction !== 'flat' && last.direction !== 'flat' && run.direction !== last.direction;

  const n = metric.series.length;
  const runHint =
    `SIGNAL (for systems thinkers): the trend fitted across all ${n} points. ` +
    `It weighs every reading, so one noisy point can't flip it. This is the arrow to act on.`;
  const lastHint =
    `LAST POINT ONLY (${last.detail}): the change from the previous reading. ` +
    `Reacting to a single data point is chasing noise, not signal — the classic mistake ` +
    `(Deming's funnel, Wheeler's SPC). Adjusting a process on one bar usually makes it worse.`;

  return (
    <span className={`mtrend${diverges ? ' mtrend-diverge' : ''}`}>
      <span className={`mtrend-run trend-${run.direction}`} title={runHint} aria-label={runHint}>
        {GLYPH[run.direction]}
      </span>
      <span className={`mtrend-last trend-${last.direction}`} title={lastHint} aria-label={lastHint}>
        {GLYPH[last.direction]}
        <span className="mtrend-last-detail"> {last.detail}</span>
      </span>
    </span>
  );
}
