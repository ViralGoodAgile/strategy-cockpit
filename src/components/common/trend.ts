import type { Metric } from '../../domain/sensors';
import type { Trend } from '../../domain/types';

// Decimals carried by a number, inferred from how the current value is written.
function decimalsOf(n: number): number {
  const s = String(n);
  const dot = s.indexOf('.');
  return dot < 0 ? 0 : s.length - dot - 1;
}

// The unit/qualifier trailing a display string ("2.3 / day" → "/ day", "99.94 %" → "%").
function suffixOf(display: string): string {
  const m = display.match(/^[\s\d.,+-]+(.*)$/);
  return m ? m[1].trim() : '';
}

// The metric as it stood `index` periods into its series — value, the point before it, and
// the series up to that point — so a numeral and its trend arrows read "as of" that period.
// At the latest index it returns the metric untouched (keeping the hand-authored display).
export function metricAt(m: Metric, index: number): Metric {
  const last = m.series.length - 1;
  const i = Math.max(0, Math.min(last, index));
  if (i === last) return m;
  const value = m.series[i];
  const prior = i > 0 ? m.series[i - 1] : m.series[i];
  const num = value.toFixed(decimalsOf(m.value));
  const suffix = suffixOf(m.display);
  return {
    ...m,
    value,
    prior,
    series: m.series.slice(0, i + 1),
    display: suffix ? `${num} ${suffix}` : num,
  };
}

// Direction of the LAST data point vs the one before it (short-term, two-point). Useful
// but tamperable — a single fresh point can flip it. Shown small and secondary.
export function metricTrend(m: Metric): Trend {
  if (m.value === m.prior) return { direction: 'flat', detail: `${m.display}` };
  const dir = m.value > m.prior ? 'up' : 'down';
  return { direction: dir, detail: `${m.prior}${m.unit} → ${m.value}${m.unit}` };
}

// Direction of the SIGNAL across the whole series — a least-squares fitted slope. This is
// the trend systems thinkers should read first: it weighs every point, so one fresh
// reading can't swing it (resists the tampering a two-point delta invites). Shown
// prominently. A near-flat fit reads "flat" rather than inventing a direction.
export function metricRunTrend(m: Metric): Trend {
  const s = m.series;
  const n = s.length;
  if (n < 2) return { direction: 'new', detail: 'one point' };
  const meanX = (n - 1) / 2;
  const meanY = s.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (s[i] - meanY);
    den += (i - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const modelledChange = slope * (n - 1); // fitted change from first point to last
  const range = Math.max(...s) - Math.min(...s);
  // "Flat" unless the fitted change clears the noise floor (2% of level or 5% of range).
  const epsilon = Math.max(Math.abs(meanY) * 0.02, range * 0.05, 1e-9);
  const direction =
    modelledChange > epsilon ? 'up' : modelledChange < -epsilon ? 'down' : 'flat';
  return { direction, detail: `${n}-pt trend` };
}
