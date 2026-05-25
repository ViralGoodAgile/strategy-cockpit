import type { TriadStory } from '../domain/sensors';

// SenseMaker reads the SHAPE of a cloud of fragments, not just its average. A mean can sit in
// an empty middle between two camps; an anomaly at the edge can matter more than the centre;
// and what counts is the direction of travel, not the absolute position. These pure helpers
// surface that shape: dispersion, bimodality, outliers, and drift measured as a vector.

export interface Bary {
  a: number;
  b: number;
  c: number;
}

const SIGNIFICANT_DRIFT = 0.12; // barycentric distance below which a shift isn't meaningful
const BIMODAL_GAP = 0.5; // inter-cluster distance that marks a split distribution
const OUTLIER_K = 1.5; // distance > mean + k·std from the centroid = an outlier

export function baryCentroid(stories: TriadStory[]): Bary | null {
  if (!stories.length) return null;
  const s = stories.reduce((o, x) => ({ a: o.a + x.a, b: o.b + x.b, c: o.c + x.c }), { a: 0, b: 0, c: 0 });
  const n = stories.length;
  return { a: s.a / n, b: s.b / n, c: s.c / n };
}

export const baryDist = (p: Bary, q: Bary) => Math.hypot(p.a - q.a, p.b - q.b, p.c - q.c);

// Spread of a cloud: mean distance of its stories from their centroid (0 = coincident).
export function dispersion(stories: TriadStory[]): number {
  const c = baryCentroid(stories);
  if (!c || stories.length < 2) return 0;
  return stories.reduce((sum, s) => sum + baryDist(s, c), 0) / stories.length;
}

// Outlier story ids: those lying far (> mean + k·std) from the centroid. Needs ≥4 stories so a
// spread is meaningful; an anomaly is highlighted, never smoothed away.
export function outlierIds(stories: TriadStory[], k = OUTLIER_K): Set<string> {
  const out = new Set<string>();
  const c = baryCentroid(stories);
  if (!c || stories.length < 4) return out;
  const dists = stories.map((s) => baryDist(s, c));
  const mean = dists.reduce((a, b) => a + b, 0) / dists.length;
  const std = Math.sqrt(dists.reduce((a, d) => a + (d - mean) ** 2, 0) / dists.length);
  if (std === 0) return out;
  stories.forEach((s, i) => {
    if (dists[i] > mean + k * std) out.add(s.id);
  });
  return out;
}

// A deterministic 2-means split, seeded by the two farthest-apart stories (a few iterations).
function split2(stories: TriadStory[]): { centroids: [Bary, Bary]; sizes: [number, number] } | null {
  if (stories.length < 4) return null;
  let i0 = 0;
  let i1 = 1;
  let best = -1;
  for (let i = 0; i < stories.length; i++)
    for (let j = i + 1; j < stories.length; j++) {
      const d = baryDist(stories[i], stories[j]);
      if (d > best) {
        best = d;
        i0 = i;
        i1 = j;
      }
    }
  let cA: Bary = { a: stories[i0].a, b: stories[i0].b, c: stories[i0].c };
  let cB: Bary = { a: stories[i1].a, b: stories[i1].b, c: stories[i1].c };
  let assign: number[] = [];
  for (let iter = 0; iter < 6; iter++) {
    assign = stories.map((s) => (baryDist(s, cA) <= baryDist(s, cB) ? 0 : 1));
    const gA = stories.filter((_, k) => assign[k] === 0);
    const gB = stories.filter((_, k) => assign[k] === 1);
    if (!gA.length || !gB.length) return null;
    cA = baryCentroid(gA)!;
    cB = baryCentroid(gB)!;
  }
  const sizeA = assign.filter((x) => x === 0).length;
  return { centroids: [cA, cB], sizes: [sizeA, stories.length - sizeA] };
}

// A cloud is bimodal when it splits into two well-separated, non-trivial clusters AND the
// centroid lands in the empty middle — so the average misrepresents a split distribution.
export function isBimodal(stories: TriadStory[]): boolean {
  const sp = split2(stories);
  const c = baryCentroid(stories);
  if (!sp || !c) return false;
  const gap = baryDist(sp.centroids[0], sp.centroids[1]);
  const minShare = Math.min(...sp.sizes) / stories.length;
  const centreToNearest = Math.min(baryDist(c, sp.centroids[0]), baryDist(c, sp.centroids[1]));
  const inTheGap = centreToNearest > gap * 0.25; // the mean sits away from both camps
  return gap >= BIMODAL_GAP && minShare >= 0.3 && inTheGap;
}

export type Pole = 0 | 1 | 2;
export interface Drift {
  magnitude: number; // barycentric distance the centroid moved
  toward: Pole; // the pole that gained the most weight
  significant: boolean;
}

// Drift as a VECTOR: how far the centroid moved (magnitude) and toward which pole (direction).
// Small magnitudes are reported as not significant, so noise isn't read as movement.
export function driftVector(prior: TriadStory[], current: TriadStory[]): Drift | null {
  const p = baryCentroid(prior);
  const q = baryCentroid(current);
  if (!p || !q) return null;
  const delta = [q.a - p.a, q.b - p.b, q.c - p.c];
  const toward = delta.indexOf(Math.max(...delta)) as Pole;
  const magnitude = baryDist(p, q);
  return { magnitude, toward, significant: magnitude >= SIGNIFICANT_DRIFT };
}
