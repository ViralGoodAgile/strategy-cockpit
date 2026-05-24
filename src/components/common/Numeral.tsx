import type { Metric } from '../../domain/sensors';
import type { Trend } from '../../domain/types';
import { MetricTrend } from './MetricTrend';
import { TrendMark } from './TrendMark';

// Re-exported so existing imports (`import { metricTrend } from '../common/Numeral'`) and
// tests keep working; the implementation lives in the pure ./trend module.
export { metricTrend, metricRunTrend } from './trend';

// A numeral treated as artwork: large value, quiet label, and a trend beneath. Pass a
// `metric` to get the full pair (prominent signal arrow + small last-point arrow); pass a
// plain `trend` for a single mark (used where the datum isn't a Metric, e.g. flow WIP).
export function Numeral({
  value,
  label,
  metric,
  trend,
}: {
  value: string;
  label: string;
  metric?: Metric;
  trend?: Trend;
}) {
  return (
    <div className="numeral">
      <div className="numeral-top">
        <div className="numeral-value num">{value}</div>
        {metric ? <MetricTrend metric={metric} /> : trend ? <TrendMark trend={trend} /> : null}
      </div>
      <div className="numeral-label">{label}</div>
    </div>
  );
}
