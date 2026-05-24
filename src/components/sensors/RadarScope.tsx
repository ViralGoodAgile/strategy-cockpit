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
// glow in the accent. Labels run up the 12 o'clock axis so the rings stay legible.
export function RadarScope({ set }: { set: RadarSet }) {
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
        return (
          <circle key={im.id} cx={p.x} cy={p.y} r={SEV_R[im.severity]} className={`radar-blip radar-${im.severity}`} />
        );
      })}
    </svg>
  );
}
