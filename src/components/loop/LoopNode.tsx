import { Handle, Position, type NodeProps } from '@xyflow/react';

// Data carried by a loop node: its label and which sides its edges attach to.
export interface LoopNodeData {
  label: string;
  targetPos: Position; // side the incoming edge connects to
  sourcePos: Position; // side the outgoing edge leaves from
  [key: string]: unknown;
}

// A loop node rendered as bare typography — no card, no visible handle (LoveFrom budget).
export function LoopNode({ data }: NodeProps) {
  const d = data as LoopNodeData;
  return (
    <div className="loop-node">
      <Handle type="target" position={d.targetPos} id="t" />
      <span className="loop-node-label">{d.label}</span>
      <Handle type="source" position={d.sourcePos} id="s" />
    </div>
  );
}
