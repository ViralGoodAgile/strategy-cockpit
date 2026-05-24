import type { ReactNode } from 'react';

// A single glass instrument tile in the cluster. `area` maps it to a grid cell.
// If `onExpand` is given, the whole tile is a button that opens a detail overlay.
export function Instrument({
  label,
  sub,
  area,
  onExpand,
  live,
  children,
}: {
  label: string;
  sub?: ReactNode;
  area: string;
  onExpand?: () => void;
  live?: boolean; // accent-tinted state line / glow for an alert reading
  children: ReactNode;
}) {
  return (
    <section
      className={`inst ${onExpand ? 'inst-clickable' : ''} ${live ? 'inst-live' : ''}`}
      style={{ gridArea: area }}
      onClick={onExpand}
    >
      <header className="inst-head">
        <span className="inst-label">{label}</span>
        {sub && <span className="inst-sub">{sub}</span>}
        {onExpand && <span className="inst-expand" aria-hidden>›</span>}
      </header>
      <div className="inst-body">{children}</div>
    </section>
  );
}
