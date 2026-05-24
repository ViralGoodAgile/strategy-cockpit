import { useState } from 'react';

const W = 220;
const H = 196;
const TOP = { x: W / 2, y: 20 };
const LEFT = { x: 28, y: H - 30 };
const RIGHT = { x: W - 28, y: H - 30 };
const MID = [
  { x: (LEFT.x + RIGHT.x) / 2, y: (LEFT.y + RIGHT.y) / 2 },
  { x: (TOP.x + RIGHT.x) / 2, y: (TOP.y + RIGHT.y) / 2 },
  { x: (TOP.x + LEFT.x) / 2, y: (TOP.y + LEFT.y) / 2 },
];
const VERTS = [TOP, LEFT, RIGHT];

// A self-signified story placed on a strategy triad (perceived lean), kept minimal.
export interface StrategyCapture {
  id: string;
  role: string;
  text: string;
  a: number;
  b: number;
  c: number;
}

// A strategy triad: three qualities at the vertices, one dot at the barycentric point
// of how developed each is (the AUTHORED lean). Near a vertex = the strategy leans on that
// quality. Survey takers can also signify stories onto it — those land as ringed champagne
// dots (the PERCEIVED lean), so the gap between authored and perceived reads at a glance.
export function StrategyTriadChart({
  labels,
  weights,
  captures = [],
}: {
  labels: [string, string, string];
  weights: [number, number, number];
  captures?: StrategyCapture[];
}) {
  const [hover, setHover] = useState(false);
  const sum = weights[0] + weights[1] + weights[2];
  const [a, b, c] = sum > 0 ? weights.map((w) => w / sum) : [1 / 3, 1 / 3, 1 / 3];
  const dot = { x: a * TOP.x + b * LEFT.x + c * RIGHT.x, y: a * TOP.y + b * LEFT.y + c * RIGHT.y };
  const pct = weights.map((w) => Math.round(w * 100));
  const right = dot.x > W / 2;
  const lines = [0, 1, 2].map((i) => `${labels[i]} ${pct[i]}%`);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="tc-svg" role="img">
      {VERTS.map((v, i) => (
        <line key={i} x1={v.x} y1={v.y} x2={MID[i].x} y2={MID[i].y} className="tc-guide" />
      ))}
      <polygon points={`${TOP.x},${TOP.y} ${LEFT.x},${LEFT.y} ${RIGHT.x},${RIGHT.y}`} className="tc-frame" />
      <text x={TOP.x} y={TOP.y - 8} className="tc-pole" textAnchor="middle">{labels[0]}</text>
      <text x={LEFT.x - 2} y={LEFT.y + 17} className="tc-pole" textAnchor="middle">{labels[1]}</text>
      <text x={RIGHT.x + 2} y={RIGHT.y + 17} className="tc-pole" textAnchor="middle">{labels[2]}</text>
      {/* perceived: survey takers' self-signified stories (ringed champagne) */}
      {captures.map((s) => {
        const p = { x: s.a * TOP.x + s.b * LEFT.x + s.c * RIGHT.x, y: s.a * TOP.y + s.b * LEFT.y + s.c * RIGHT.y };
        return (
          <g key={s.id} className="tc-dot-hit">
            <title>{`${s.role}: ${s.text} (your signified story)`}</title>
            <circle cx={p.x} cy={p.y} r={7.5} className="tc-dot-ring" />
            <circle cx={p.x} cy={p.y} r={4.5} className="tc-dot tc-dot-captured" />
          </g>
        );
      })}
      {/* authored: the strategy's own lean (solid champagne centroid) */}
      <g
        className="tc-dot-hit"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <title>{`Authored lean · ${lines.join(' · ')}`}</title>
        {/* generous transparent hit area so the small dot is easy to hover */}
        <circle cx={dot.x} cy={dot.y} r={12} fill="transparent" />
        <circle cx={dot.x} cy={dot.y} r={hover ? 8 : 6} className={`tc-centroid${hover ? ' tc-centroid-on' : ''}`} />
      </g>
      {/* on hover: the three quality strengths behind the dot's position */}
      {hover &&
        lines.map((t, i) => (
          <text
            key={i}
            x={dot.x + (right ? -11 : 11)}
            y={dot.y - 11 + i * 12}
            textAnchor={right ? 'end' : 'start'}
            className="tc-tip"
          >
            {t}
          </text>
        ))}
    </svg>
  );
}
