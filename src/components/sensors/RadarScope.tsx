import { useState } from 'react';
import type { Impediment, RadarSet, ScopeLevel } from '../../domain/sensors';

const W = 240;
const C = W / 2;
const MAXR = 108;
// Scope rings, inner -> outer: pod is most local, super-org is outside the organisation.
const RINGS: { level: ScopeLevel; label: string; r: number }[] = [
  { level: 'pod', label: 'pod', r: MAXR * 0.33 },
  { level: 'function', label: 'function', r: MAXR * 0.57 },
  { level: 'org', label: 'org', r: MAXR * 0.79 },
  { level: 'superorg', label: 'super-org', r: MAXR },
];
const SEV_R: Record<Impediment['severity'], number> = { high: 6.5, med: 5, low: 4 };

function ringRadius(level: ScopeLevel): number {
  return RINGS.find((r) => r.level === level)!.r;
}
function blip(im: Impediment) {
  const rad = (im.angle * Math.PI) / 180;
  const r = ringRadius(im.level) - 7;
  return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) };
}

// A ship's-radar of impediments. Range = organisational scope; high-severity blips
// glow in the accent. Each blip is hoverable: it highlights and names itself, so you can
// tell which impediment is which (the scope is too dense for permanent labels).
export function RadarScope({ set, onInspect }: { set: RadarSet; onInspect?: () => void }) {
  const [hover, setHover] = useState<string | null>(null);
  const hovered = hover ? set.impediments.find((i) => i.id === hover) : null;

  return (
    <svg viewBox={`0 0 ${W} ${W}`} className="radar-svg" role="img">
      {RINGS.map((ring) => (
        <circle key={ring.level} cx={C} cy={C} r={ring.r} className="radar-ring" />
      ))}
      <circle cx={C} cy={C} r={2.5} className="radar-hub" />

      {RINGS.map((ring) => (
        <text key={ring.level} x={C} y={C - ring.r - 3} className="radar-ring-label" textAnchor="middle">
          {ring.label}
        </text>
      ))}

      {set.impediments.map((im) => {
        const p = blip(im);
        const on = hover === im.id;
        const dim = hover != null && !on;
        return (
          <g
            key={im.id}
            className="radar-blip-hit"
            onMouseEnter={() => {
              onInspect?.();
              setHover(im.id);
            }}
            onMouseLeave={() => setHover((h) => (h === im.id ? null : h))}
          >
            <title>{`${im.label} · ${im.level} · ${im.severity}`}</title>
            <circle
              cx={p.x}
              cy={p.y}
              r={SEV_R[im.severity] + (on ? 2 : 0)}
              className={`radar-blip radar-${im.severity}${on ? ' radar-blip-hover' : ''}${dim ? ' radar-blip-dim' : ''}`}
            />
          </g>
        );
      })}

      {/* Hovered impediment's name, drawn last so nothing overlaps it. Offset toward the
          centre and anchored by side so it stays inside the scope. */}
      {hovered &&
        (() => {
          const p = blip(hovered);
          const right = p.x > C;
          return (
            <text
              x={p.x + (right ? -9 : 9)}
              y={p.y - 9}
              textAnchor={right ? 'end' : 'start'}
              className="radar-tip"
            >
              {hovered.label}
            </text>
          );
        })()}
    </svg>
  );
}
