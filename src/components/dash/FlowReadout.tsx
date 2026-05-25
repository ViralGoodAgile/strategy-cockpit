import { FLOW_CONSTRAINT_SIGNAL } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { offsetFromNow } from '../../mirrors/snapshotHistory';
import { PERIODS, frameForPeriod, periodLabel } from '../../lib/timeTravel';
import { FlowBoard, FlowLegend } from '../sensors/FlowBoard';
import { Instrument } from './Instrument';

// The Flow tile shows the whole board AS OF the dashboard's global as-of, driven by the ONE
// master clock (the global time-travel control) — so pressing play animates the flow board in
// lockstep with every other tile, and the whole dashboard reads as a single movie. The flow
// simulation runs at a finer cadence than the global periods, so the period is projected onto a
// frame. Expand for the widget's own scrubber + speeds (which override the global clock).
export function FlowReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const timeIndex = useCockpit((s) => s.timeIndex);
  const { frames, caps } = FLOW_CONSTRAINT_SIGNAL.value;
  const last = PERIODS - 1;
  const w = frameForPeriod(timeIndex, last, frames.length);
  const asOf = periodLabel(offsetFromNow(timeIndex, last), timeUnit);

  const f = frames[w];
  const constraint = f.constraint === 'review' ? 'Review' : 'Build';
  const queued = f[f.constraint].queue.length;
  const shipped = w === 0 ? f.done.length : f.done.length - frames[w - 1].done.length;

  return (
    <Instrument
      label="Flow.Constraint"
      sub={`theory of constraints · ${asOf}`}
      area="flow"
      live={queued >= 3}
      onExpand={() => setDetail('flow')}
    >
      <div className="frw">
        <div className="frw-head">
          <span className="frw-constraint">
            constraint <strong>{constraint}</strong>
          </span>
          <span className="frw-stat"><span className="num">{queued}</span> queued</span>
          <span className="frw-stat"><span className="num">~{shipped}</span>/wk shipped</span>
          <span className="frw-week">{f.label}</span>
          <FlowLegend />
        </div>
        <div className="frw-board">
          <FlowBoard frame={f} caps={caps} />
        </div>
      </div>
    </Instrument>
  );
}
