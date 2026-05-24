import type { MandateLevel } from './types';

// Cutler's A–I "sphere of authority" ladder, canonical labels (spec glossary).
export const MANDATE_LABELS: Record<MandateLevel, string> = {
  A: 'build exactly this to specification',
  B: 'small-scope build with light interpretation',
  C: 'problem framed; team chooses how',
  D: 'framed problem with target user / segment',
  E: 'framed opportunity with success criterion',
  F: 'move a known business-outcome metric',
  G: 'solve for a stated customer outcome',
  H: 'address an opportunity area',
  I: 'generate a long-term business outcome',
};

// Ordered low (A) to high (I) autonomy.
export const MANDATE_ORDER: MandateLevel[] = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
];

// Numeric index of a level (A=0 .. I=8).
export function levelIndex(l: MandateLevel): number {
  return MANDATE_ORDER.indexOf(l);
}

// Signed step distance between two levels (positive = b is higher than a).
export function levelGap(a: MandateLevel, b: MandateLevel): number {
  return levelIndex(b) - levelIndex(a);
}

// Median level of a set of work-implied levels (rounds down on ties).
export function medianLevel(levels: MandateLevel[]): MandateLevel | null {
  if (levels.length === 0) return null;
  const sorted = [...levels].map(levelIndex).sort((x, y) => x - y);
  const mid = sorted[Math.floor((sorted.length - 1) / 2)];
  return MANDATE_ORDER[mid];
}
