import { useState } from 'react';
import type { Triad, TriadStory } from '../../domain/sensors';
import { outlierIds } from '../../mirrors/triadShape';

const W = 240;
const H = 214;
// Vertices: pole[0] top, pole[1] lower-left, pole[2] lower-right.
const TOP = { x: W / 2, y: 22 };
const LEFT = { x: 30, y: H - 30 };
const RIGHT = { x: W - 30, y: H - 30 };
const VERTS = [TOP, LEFT, RIGHT];
// Edge midpoints, for faint median guide lines (help the eye read position).
const MID = [
  { x: (LEFT.x + RIGHT.x) / 2, y: (LEFT.y + RIGHT.y) / 2 }, // opposite TOP
  { x: (TOP.x + RIGHT.x) / 2, y: (TOP.y + RIGHT.y) / 2 }, // opposite LEFT
  { x: (TOP.x + LEFT.x) / 2, y: (TOP.y + LEFT.y) / 2 }, // opposite RIGHT
];

function place(a: number, b: number, c: number) {
  return { x: a * TOP.x + b * LEFT.x + c * RIGHT.x, y: a * TOP.y + b * LEFT.y + c * RIGHT.y };
}
function centroid(stories: TriadStory[]) {
  if (!stories.length) return null;
  const s = stories.reduce(
    (acc, st) => {
      const p = place(st.a, st.b, st.c);
      return { x: acc.x + p.x, y: acc.y + p.y };
    },
    { x: 0, y: 0 },
  );
  return { x: s.x / stories.length, y: s.y / stories.length };
}

// One triad triangle. Self-signified dots (respondent places them, C2), a median
// guide grid for readability, current centroid + drift line from the prior period.
// Each story dot is hoverable: it highlights and names its author-role (with the full
// story shown beneath when there's room), so you can tell which dot is which story.
export function TriadChart({
  triad,
  showStory = true,
  onInspect,
}: {
  triad: Triad;
  showStory?: boolean;
  onInspect?: () => void; // called when a dot is hovered — lets a movie pause so it stops moving
}) {
  const [pinned, setPinned] = useState<TriadStory | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const current = triad.stories.filter((s) => s.period === 'current');
  const prior = triad.stories.filter((s) => s.period === 'prior');
  const cNow = centroid(current);
  const cPrior = centroid(prior);
  const outliers = outlierIds(current); // anomalies far from the cloud — surfaced, not smoothed

  // Hover takes precedence; a click pins a story so it stays after the mouse leaves.
  const active = current.find((s) => s.id === hoverId) ?? pinned;

  return (
    <div className="tc">
      <svg viewBox={`0 0 ${W} ${H}`} className="tc-svg" role="img">
        {/* faint median guides */}
        {VERTS.map((v, i) => (
          <line key={i} x1={v.x} y1={v.y} x2={MID[i].x} y2={MID[i].y} className="tc-guide" />
        ))}
        <polygon
          points={`${TOP.x},${TOP.y} ${LEFT.x},${LEFT.y} ${RIGHT.x},${RIGHT.y}`}
          className="tc-frame"
        />
        {/* drift from prior centroid to current */}
        {cPrior && cNow && (
          <line x1={cPrior.x} y1={cPrior.y} x2={cNow.x} y2={cNow.y} className="tc-drift" />
        )}
        {cPrior && <circle cx={cPrior.x} cy={cPrior.y} r={4.5} className="tc-prior" />}
        {current.map((s) => {
          const p = place(s.a, s.b, s.c);
          const on = active?.id === s.id;
          const outlier = outliers.has(s.id);
          return (
            <g
              key={s.id}
              className="tc-dot-hit"
              onMouseEnter={() => {
                onInspect?.();
                setHoverId(s.id);
              }}
              onMouseLeave={() => setHoverId((h) => (h === s.id ? null : h))}
              onClick={() => setPinned((cur) => (cur?.id === s.id ? null : s))}
            >
              <title>{`${s.role}: ${s.text}${s.captured ? ' (your signified story)' : ''}${outlier ? ' — outlier' : ''}`}</title>
              {s.captured && (
                <circle cx={p.x} cy={p.y} r={on ? 9 : 7.5} className="tc-dot-ring" />
              )}
              {outlier && <circle cx={p.x} cy={p.y} r={on ? 9 : 7.5} className="tc-dot-outlier-ring" />}
              <circle
                cx={p.x}
                cy={p.y}
                r={on ? 6 : 4.5}
                className={`tc-dot${on ? ' tc-dot-on' : ''}${s.captured ? ' tc-dot-captured' : ''}${
                  outlier ? ' tc-dot-outlier' : ''
                }`}
              />
            </g>
          );
        })}
        {cNow && <circle cx={cNow.x} cy={cNow.y} r={6} className="tc-centroid" />}
        {/* vertex labels (concise) */}
        <text x={TOP.x} y={TOP.y - 8} className="tc-pole" textAnchor="middle">{triad.poles[0].short}</text>
        <text x={LEFT.x - 2} y={LEFT.y + 18} className="tc-pole" textAnchor="middle">{triad.poles[1].short}</text>
        <text x={RIGHT.x + 2} y={RIGHT.y + 18} className="tc-pole" textAnchor="middle">{triad.poles[2].short}</text>
      </svg>
      {/* The hovered/pinned story reads in a reserved caption beneath the triangle — never
          floated over the dots (which overlapped the centroid + guides). Always rendered so
          the columns stay aligned and nothing reflows on hover. */}
      {showStory && (
        <p className="tc-story">
          {active ? (
            <>
              <span className="tc-role">{active.role}</span>
              {active.text}
              {active.captured && <span className="tc-mine"> · yours</span>}
            </>
          ) : (
            <span className="tc-story-hint">hover a dot for its story</span>
          )}
        </p>
      )}
    </div>
  );
}
