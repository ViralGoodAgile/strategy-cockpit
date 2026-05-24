import { STRATEGY_TRIADS } from '../data/strategyTriads';
import { QUALITIES } from '../domain/qualities';
import { qualityStrength } from './qualityStrength';
import type { QualityId, Strategy } from '../domain/types';

const nameOf = (id: QualityId) => QUALITIES.find((q) => q.id === id)?.name ?? id;

// A strategy triad ready to render: its three quality labels, their computed weights,
// and which quality the strategy leans on (strong) vs neglects (weak).
export interface TriadView {
  id: string;
  title: string;
  labels: [string, string, string];
  weights: [number, number, number];
  strong: string;
  weak: string;
}

export function strategyTriadViews(s: Strategy): TriadView[] {
  const str = qualityStrength(s);
  return STRATEGY_TRIADS.map((t) => {
    const weights = t.qualities.map((q) => str[q]) as [number, number, number];
    const labels = t.qualities.map(nameOf) as [string, string, string];
    const maxI = weights.indexOf(Math.max(...weights));
    const minI = weights.indexOf(Math.min(...weights));
    return { id: t.id, title: t.title, labels, weights, strong: labels[maxI], weak: labels[minI] };
  });
}
