import type { Metric } from '../../domain/sensors';
import type { Trend } from '../../domain/types';

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
