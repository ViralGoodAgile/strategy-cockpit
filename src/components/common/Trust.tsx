import type { Freshness } from '../../domain/types';

// How much to trust a finding, given the freshness of the input it rests on.
export function trustNote(freshness: Freshness, source: string): string {
  if (freshness === 'stale' || freshness === 'dead')
    return `Treat as a prompt, not a fact — ${source} is ${freshness}.`;
  if (freshness === 'aging') return `Rests on aging ${source} data.`;
  return `Rests on current ${source} data.`;
}

// A small freshness pill (colour signals trust).
export function FreshPill({ freshness }: { freshness: Freshness }) {
  return <span className={`fresh-pill fresh-${freshness}`}>{freshness}</span>;
}
