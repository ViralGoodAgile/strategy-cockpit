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

const place = (a: number, b: number, c: number) => ({
  x: a * TOP.x + b * LEFT.x + c * RIGHT.x,
  y: a * TOP.y + b * LEFT.y + c * RIGHT.y,
});

// A self-signified story placed on a strategy triad (perceived lean), kept minimal.
export interface StrategyCapture {
  id: string;
  role: string;
  text: string;
  a: number;
  b: number;
  c: number;
}

// A strategy triad: three qualities at the vertices, one solid dot at the barycentric point
// of how developed each is (the AUTHORED lean). Survey takers can also signify stories onto
// it — those land as ringed champagne dots (the PERCEIVED lean). Hover detail reads in a
// caption beneath the triangle (when showStory), never floated over the dots.
export function StrategyTriadChart({
  labels,
  weights,
  captures = [],
  showStory = false,
}: {
  labels: [string, string, string];
  weights: [number, number, number];
  captures?: StrategyCapture[];
  showStory?: boolean;
}) {
  const [authorHover, setAuthorHover] = useState(false);
  const [activeCap, setActiveCap] = useState<StrategyCapture | null>(null);

  const sum = weights[0] + weights[1] + weights[2];
  const [a, b, c] = sum > 0 ? weights.map((w) => w / sum) : [1 / 3, 1 / 3, 1 / 3];
  const dot = place(a, b, c);
  const pct = weights.map((w) => Math.round((sum > 0 ? w / sum : 1 / 3) * 100));
  const lines = [0, 1, 2].map((i) => `${labels[i]} ${pct[i]}%`);

  return (
    <div className="tc">
      <svg viewBox={`0 0 ${W} ${H}`} className="tc-svg" role="img">
        {VERTS.map((v, i) => (
          <line key={i} x1={v.x} y1={v.y} x2={MID[i].x} y2={MID[i].y} className="tc-guide" />
        ))}
        <polygon points={`${TOP.x},${TOP.y} ${LEFT.x},${LEFT.y} ${RIGHT.x},${RIGHT.y}`} className="tc-frame" />
        <text x={TOP.x} y={TOP.y - 8} className="tc-pole" textAnchor="middle">{labels[0]}</text>
        <text x={LEFT.x - 2} y={LEFT.y + 17} className="tc-pole" textAnchor="middle">{labels[1]}</text>
        <text x={RIGHT.x + 2} y={RIGHT.y + 17} className="tc-pole" textAnchor="middle">{labels[2]}</text>

        {/* perceived: survey takers' self-signified stories (ringed champagne, hoverable) */}
        {captures.map((s) => {
          const p = place(s.a, s.b, s.c);
          const on = activeCap?.id === s.id;
          return (
            <g
              key={s.id}
              className="tc-dot-hit"
              onMouseEnter={() => setActiveCap(s)}
              onMouseLeave={() => setActiveCap((cur) => (cur?.id === s.id ? null : cur))}
            >
              <title>{`${s.role}: ${s.text} (your signified story)`}</title>
              <circle cx={p.x} cy={p.y} r={on ? 9 : 7.5} className="tc-dot-ring" />
              <circle cx={p.x} cy={p.y} r={on ? 6 : 4.5} className="tc-dot tc-dot-captured" />
            </g>
          );
        })}

        {/* authored: the strategy's own lean (solid champagne centroid, hoverable) */}
        <g
          className="tc-dot-hit"
          onMouseEnter={() => setAuthorHover(true)}
          onMouseLeave={() => setAuthorHover(false)}
        >
          <title>{`Authored lean · ${lines.join(' · ')}`}</title>
          <circle cx={dot.x} cy={dot.y} r={12} fill="transparent" />
          <circle cx={dot.x} cy={dot.y} r={authorHover ? 8 : 6} className={`tc-centroid${authorHover ? ' tc-centroid-on' : ''}`} />
        </g>
      </svg>

      {/* reserved caption: a person's story takes precedence over the authored read-out */}
      {showStory && (
        <p className="tc-story">
          {activeCap ? (
            <>
              <span className="tc-role">{activeCap.role}</span>
              {activeCap.text}
              <span className="tc-mine"> · yours</span>
            </>
          ) : authorHover ? (
            <>
              <span className="tc-role">authored lean</span>
              {lines.join(' · ')}
            </>
          ) : (
            <span className="tc-story-hint">hover the dots — solid is authored, ringed are people’s stories</span>
          )}
        </p>
      )}
    </div>
  );
}
