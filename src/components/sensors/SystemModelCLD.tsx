import { useId } from 'react';
import type { SystemModel } from '../../domain/sensors';

const W = 320;
const H = 280;
const PAD_X = 26;
const PAD_Y = 30;
const NODE_GAP = 9; // trim arrow ends so they don't touch the node label

function px(v: { x: number; y: number }) {
  return { x: PAD_X + v.x * (W - 2 * PAD_X), y: PAD_Y + v.y * (H - 2 * PAD_Y) };
}

// Larman/Senge Causal Loop Diagram. Link class shown by line style: causation solid,
// correlation dashed, hypothesis dotted (default is correlation). A seed for dialogue.
export function SystemModelCLD({ model, detailed = false }: { model: SystemModel; detailed?: boolean }) {
  const arrow = useId();
  const dash = (k: string) => (k === 'causation' ? undefined : k === 'correlation' ? '5 3' : '1.5 3.5');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="cld-svg" role="img">
      <defs>
        <marker id={arrow} markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L7,3 L0,6 Z" className="cld-arrowhead" />
        </marker>
      </defs>

      {model.links.map((l, i) => {
        const a = px(model.variables.find((v) => v.id === l.from)!);
        const b = px(model.variables.find((v) => v.id === l.to)!);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const x1 = a.x + ux * NODE_GAP;
        const y1 = a.y + uy * NODE_GAP;
        const x2 = b.x - ux * (NODE_GAP + 4);
        const y2 = b.y - uy * (NODE_GAP + 4);
        return (
          <g key={i}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="cld-link"
              strokeDasharray={dash(l.kind)}
              markerEnd={`url(#${arrow})`}
            />
            {detailed && (
              <text
                x={(x1 + x2) / 2 + uy * 7}
                y={(y1 + y2) / 2 - ux * 7 + 3}
                className={`cld-sign ${l.sign === '-' ? 'cld-sign-neg' : ''}`}
                textAnchor="middle"
              >
                {l.sign}
              </text>
            )}
          </g>
        );
      })}

      {model.loops.map((lp) => {
        const p = px(lp);
        return detailed ? (
          <text key={lp.id} x={p.x} y={p.y} className="cld-loop" textAnchor="middle">
            {lp.type}
          </text>
        ) : null;
      })}

      {model.variables.map((v) => {
        const p = px(v);
        return (
          <g key={v.id}>
            <circle cx={p.x} cy={p.y} r={3.5} className="cld-node" />
            <text x={p.x} y={p.y - 8} className="cld-label" textAnchor="middle">
              {v.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
