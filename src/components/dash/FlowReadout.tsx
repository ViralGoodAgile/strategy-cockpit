import { useEffect, useState } from 'react';
import { FLOW_CONSTRAINT_SIGNAL } from '../../data/sensorData';
import { useCockpit } from '../../store/useCockpit';
import { FlowBoard, FlowLegend } from '../sensors/FlowBoard';
import { Instrument } from './Instrument';

// The Flow tile shows the WHOLE board, auto-playing, so it can be skimmed in place
// without clicking. Expand for the scrubber + playback speeds.
export function FlowReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const { frames, caps } = FLOW_CONSTRAINT_SIGNAL.value;
  const [w, setW] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setW((x) => (x + 1) % frames.length), 1100);
    return () => clearInterval(id);
  }, [frames.length]);

  const f = frames[w];
  const constraint = f.constraint === 'review' ? 'Review' : 'Build';
  const queued = f[f.constraint].queue.length;
  const shipped = w === 0 ? f.done.length : f.done.length - frames[w - 1].done.length;

  return (
    <Instrument
      label="Flow.Constraint"
      sub="theory of constraints · live"
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
