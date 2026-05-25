import { describe, it, expect } from 'vitest';
import { dispersion, driftVector, isBimodal, outlierIds } from './triadShape';
import type { TriadStory } from '../domain/sensors';

let seq = 0;
const st = (a: number, b: number, c: number, period: 'current' | 'prior' = 'current'): TriadStory => ({
  id: `s${seq++}`,
  role: 'role',
  text: 'a fragment',
  a,
  b,
  c,
  period,
});

describe('triadShape — SenseMaker distribution reading', () => {
  it('dispersion is zero for a coincident cloud and positive when spread', () => {
    expect(dispersion([st(0.4, 0.3, 0.3), st(0.4, 0.3, 0.3)])).toBe(0);
    expect(dispersion([st(0.9, 0.05, 0.05), st(0.05, 0.9, 0.05)])).toBeGreaterThan(0);
  });

  it('surfaces an anomaly far from the centre as an outlier', () => {
    const far = st(1, 0, 0);
    const cloud = [st(0.34, 0.33, 0.33), st(0.34, 0.33, 0.33), st(0.34, 0.33, 0.33), far];
    const out = outlierIds(cloud);
    expect(out.size).toBe(1);
    expect(out.has(far.id)).toBe(true);
  });

  it('needs enough stories before calling anything an outlier', () => {
    expect(outlierIds([st(1, 0, 0), st(0.33, 0.33, 0.34)]).size).toBe(0);
  });

  it('flags a split (bimodal) distribution where the mean misleads', () => {
    const split = [
      st(0.9, 0.05, 0.05),
      st(0.9, 0.05, 0.05),
      st(0.9, 0.05, 0.05),
      st(0.05, 0.9, 0.05),
      st(0.05, 0.9, 0.05),
      st(0.05, 0.9, 0.05),
    ];
    expect(isBimodal(split)).toBe(true);
  });

  it('does not flag a single tight cluster as bimodal', () => {
    const tight = Array.from({ length: 6 }, () => st(0.34, 0.33, 0.33));
    expect(isBimodal(tight)).toBe(false);
  });

  it('reads drift as a vector — direction and magnitude', () => {
    const prior = [st(0.8, 0.1, 0.1, 'prior'), st(0.8, 0.1, 0.1, 'prior'), st(0.8, 0.1, 0.1, 'prior')];
    const current = [st(0.1, 0.8, 0.1), st(0.1, 0.8, 0.1), st(0.1, 0.8, 0.1)];
    const d = driftVector(prior, current)!;
    expect(d.toward).toBe(1); // toward pole b
    expect(d.significant).toBe(true);
    expect(d.magnitude).toBeGreaterThan(0.5);
  });

  it('reports a tiny move as not significant', () => {
    const prior = [st(0.34, 0.33, 0.33, 'prior')];
    const current = [st(0.35, 0.33, 0.32)];
    const d = driftVector(prior, current)!;
    expect(d.significant).toBe(false);
  });

  it('returns null drift when a period is empty', () => {
    expect(driftVector([], [st(0.4, 0.3, 0.3)])).toBeNull();
  });
});
