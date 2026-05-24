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

// A strategy triad: three qualities at the vertices, one dot at the barycentric point
// of how developed each is. Near a vertex = the strategy leans on that quality.
export function StrategyTriadChart({ labels, weights }: { labels: [string, string, string]; weights: [number, number, number] }) {
  const sum = weights[0] + weights[1] + weights[2];
  const [a, b, c] = sum > 0 ? weights.map((w) => w / sum) : [1 / 3, 1 / 3, 1 / 3];
  const dot = { x: a * TOP.x + b * LEFT.x + c * RIGHT.x, y: a * TOP.y + b * LEFT.y + c * RIGHT.y };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="tc-svg" role="img">
      {VERTS.map((v, i) => (
        <line key={i} x1={v.x} y1={v.y} x2={MID[i].x} y2={MID[i].y} className="tc-guide" />
      ))}
      <polygon points={`${TOP.x},${TOP.y} ${LEFT.x},${LEFT.y} ${RIGHT.x},${RIGHT.y}`} className="tc-frame" />
      <circle cx={dot.x} cy={dot.y} r={6} className="tc-centroid" />
      <text x={TOP.x} y={TOP.y - 8} className="tc-pole" textAnchor="middle">{labels[0]}</text>
      <text x={LEFT.x - 2} y={LEFT.y + 17} className="tc-pole" textAnchor="middle">{labels[1]}</text>
      <text x={RIGHT.x + 2} y={RIGHT.y + 17} className="tc-pole" textAnchor="middle">{labels[2]}</text>
    </svg>
  );
}
