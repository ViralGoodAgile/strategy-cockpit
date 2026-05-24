import type { FlowFrame, SimItem, WorkItemType } from '../../domain/sensors';

// Work-item types and their human labels (colour set in sensors.css).
export const TYPE_LABEL: Record<WorkItemType, string> = {
  feature: 'feature',
  enterprise: 'enterprise',
  bug: 'bug',
  debt: 'tech debt',
};
const TYPES: WorkItemType[] = ['feature', 'enterprise', 'bug', 'debt'];

// A single work item as a colour-coded tile.
function Tile({ item }: { item: SimItem }) {
  return <span className={`fi-tile fi-${item.type}`} title={`${item.id} · ${TYPE_LABEL[item.type]}`} />;
}

// A zone of tiles (queued or active) with a count label.
function Zone({ kind, items, cap }: { kind: string; items: SimItem[]; cap?: number }) {
  return (
    <div className={`fi-zone fi-zone-${kind}`}>
      <div className="fi-zone-label">
        {kind} {items.length}
        {cap != null && <span className="fi-cap"> / {cap}</span>}
      </div>
      <div className="fi-tiles">
        {items.map((i) => (
          <Tile key={i.id} item={i} />
        ))}
      </div>
    </div>
  );
}

// The item board for one frame: Build and Review each split queued/active, then Done.
export function FlowBoard({ frame, caps }: { frame: FlowFrame; caps: { build: number; review: number } }) {
  return (
    <div className="fi-board">
      {(['build', 'review'] as const).map((stage) => (
        <div className={`fi-stage ${frame.constraint === stage ? 'fi-stage-c' : ''}`} key={stage}>
          <div className="fi-stage-head">
            {stage === 'build' ? 'Build' : 'Review'}
            {frame.constraint === stage && <span className="fi-flag"> constraint</span>}
          </div>
          <Zone kind="queued" items={frame[stage].queue} />
          <Zone kind="active" items={frame[stage].active} cap={caps[stage]} />
        </div>
      ))}
      <div className="fi-stage fi-stage-done">
        <div className="fi-stage-head">Done</div>
        <div className="fi-done-count num">{frame.done.length}</div>
        <div className="fi-tiles fi-done-tiles">
          {frame.done.map((i) => (
            <Tile key={i.id} item={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Shared colour legend for work-item types.
export function FlowLegend() {
  return (
    <div className="fi-legend">
      {TYPES.map((t) => (
        <span key={t}>
          <i className={`fi-tile fi-${t}`} /> {TYPE_LABEL[t]}
        </span>
      ))}
    </div>
  );
}
