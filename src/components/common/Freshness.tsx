import type { Freshness } from '../../domain/types';
import { ageInDays } from '../../lib/freshness';

// A quiet, always-present provenance line: as-of + freshness. No naked numbers.
export function FreshnessLine({
  observedAt,
  freshness,
  prefix = 'observed',
}: {
  observedAt: string;
  freshness: Freshness;
  prefix?: string;
}) {
  const age = ageInDays(observedAt);
  const ageText = age === 0 ? 'today' : age === 1 ? '1 day ago' : `${age} days ago`;
  return (
    <span className={`freshness freshness-${freshness}`}>
      {prefix} {ageText} · {freshness}
    </span>
  );
}
