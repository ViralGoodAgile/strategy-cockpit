import type { Metric } from '../../domain/sensors';
import type { Trend } from '../../domain/types';
import { TrendMark } from './TrendMark';

// Direction of travel for a metric (neutral — movement, not pass/fail).
export function metricTrend(m: Metric): Trend {
  if (m.value === m.prior) return { direction: 'flat', detail: `${m.display}` };
  const dir = m.value > m.prior ? 'up' : 'down';
  return { direction: dir, detail: `${m.prior}${m.unit} → ${m.value}${m.unit}` };
}

// A numeral treated as artwork: large value, quiet label, trend beneath.
export function Numeral({
  value,
  label,
  trend,
}: {
  value: string;
  label: string;
  trend?: Trend;
}) {
  return (
    <div className="numeral">
      <div className="numeral-value num">{value}</div>
      <div className="numeral-label">{label}</div>
      {trend && <TrendMark trend={trend} />}
    </div>
  );
}
