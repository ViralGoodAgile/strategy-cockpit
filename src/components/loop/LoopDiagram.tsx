import { useMemo } from 'react';
import {
  ReactFlow,
  MarkerType,
  Position,
  type Edge,
  type Node,
  type EdgeMouseHandler,
} from '@xyflow/react';
import type { Closure } from '../../domain/types';
import { useCockpit } from '../../store/useCockpit';
import { loopClosure } from '../../mirrors/loopClosure';
import { LoopNode, type LoopNodeData } from './LoopNode';

// Register the single custom node type once (must be stable across renders).
const nodeTypes = { loop: LoopNode };

// Jewel-tone flow status (mirrors tokens.css --tl-*): emerald flowing, topaz slowing, garnet stopped.
const COLOR: Record<Closure, string> = {
  flow: '#6fa987',
  partial: '#c9a25c',
  stop: '#b65f61',
};

// Fixed loop layout — the eight nodes the spec draws, positioned as a rectangle.
const NODES: Node<LoopNodeData>[] = [
  { id: 'intent', type: 'loop', position: { x: 0, y: 0 }, data: { label: 'INTENT', targetPos: Position.Bottom, sourcePos: Position.Right } },
  { id: 'deployment', type: 'loop', position: { x: 220, y: 0 }, data: { label: 'DEPLOYMENT', targetPos: Position.Left, sourcePos: Position.Right } },
  { id: 'action', type: 'loop', position: { x: 470, y: 0 }, data: { label: 'ACTION', targetPos: Position.Left, sourcePos: Position.Right } },
  { id: 'reality', type: 'loop', position: { x: 690, y: 0 }, data: { label: 'REALITY', targetPos: Position.Left, sourcePos: Position.Bottom } },
  { id: 'sensors', type: 'loop', position: { x: 690, y: 220 }, data: { label: 'SENSORS', targetPos: Position.Top, sourcePos: Position.Left } },
  { id: 'patterns', type: 'loop', position: { x: 470, y: 220 }, data: { label: 'PATTERNS', targetPos: Position.Right, sourcePos: Position.Left } },
  { id: 'learning', type: 'loop', position: { x: 220, y: 220 }, data: { label: 'LEARNING', targetPos: Position.Right, sourcePos: Position.Left } },
  { id: 'adaptation', type: 'loop', position: { x: 0, y: 220 }, data: { label: 'ADAPTATION', targetPos: Position.Right, sourcePos: Position.Top } },
];

// The eight directed edges; e8 (ADAPTATION -> INTENT) is the return arrow.
const EDGE_DEFS: { id: string; source: string; target: string }[] = [
  { id: 'e1', source: 'intent', target: 'deployment' },
  { id: 'e2', source: 'deployment', target: 'action' },
  { id: 'e3', source: 'action', target: 'reality' },
  { id: 'e4', source: 'reality', target: 'sensors' },
  { id: 'e5', source: 'sensors', target: 'patterns' },
  { id: 'e6', source: 'patterns', target: 'learning' },
  { id: 'e7', source: 'learning', target: 'adaptation' },
  { id: 'e8', source: 'adaptation', target: 'intent' },
];

const RETURN_EDGE = 'e8';

// The seven/eight-node loop, rendered with React Flow as a static, click-to-mark diagram.
export function LoopDiagram() {
  const closures = useCockpit((s) => s.closures);
  const setClosure = useCockpit((s) => s.setClosure);
  const versions = useCockpit((s) => s.versions);

  // The return path (Reality → Intent) is EVIDENCE-DRIVEN, not manual: it closes only
  // if Intent was revised after a real outcome shift (Loop.Closure).
  const returnState = loopClosure(versions).state;

  const edges: Edge[] = useMemo(
    () =>
      EDGE_DEFS.map((e) => {
        // Forward arrows flow (progress occurs) and are manually adjustable; the return
        // arrow is set by evidence of a closed feedback loop.
        const closure: Closure =
          e.id === RETURN_EDGE ? returnState : (closures[e.id] ?? 'flow');
        const color = COLOR[closure];
        const stopped = closure === 'stop';
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: 's',
          targetHandle: 't',
          type: 'straight',
          animated: !stopped, // flowing arrows animate; a stop is static — progress halted
          style: {
            stroke: color,
            strokeWidth: stopped ? 1.5 : 2,
            strokeDasharray: stopped ? '2 4' : undefined,
          },
          markerEnd: { type: MarkerType.ArrowClosed, color, width: 14, height: 14 },
        };
      }),
    [closures, returnState],
  );

  // Click a FORWARD arrow to cycle: flow -> partial -> stop -> flow. The return arrow
  // is evidence-driven and not manually toggled.
  const onEdgeClick: EdgeMouseHandler = (_e, edge) => {
    if (edge.id === RETURN_EDGE) return;
    const cur: Closure = closures[edge.id] ?? 'flow';
    const next: Closure = cur === 'flow' ? 'partial' : cur === 'partial' ? 'stop' : 'flow';
    setClosure(edge.id, next);
  };

  return (
    <div className="loop-canvas">
      <ReactFlow
        nodes={NODES}
        edges={edges}
        nodeTypes={nodeTypes}
        onEdgeClick={onEdgeClick}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        edgesFocusable
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}
