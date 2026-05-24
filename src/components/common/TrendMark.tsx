import type { Trend } from '../../domain/types';

// Typographic direction-of-travel marker. The cockpit leads with movement, not pass/fail.
const GLYPH: Record<Trend['direction'], string> = {
  up: '↑', // ↑
  down: '↓', // ↓
  flat: '→', // → (steady)
  new: '·', // ·
};

export function TrendMark({ trend }: { trend?: Trend }) {
  if (!trend) return null;
  return (
    <span className={`trend trend-${trend.direction}`} title={trend.detail}>
      <span className="trend-glyph">{GLYPH[trend.direction]}</span>
      {trend.detail && <span className="trend-detail">{trend.detail}</span>}
    </span>
  );
}
