import { useCockpit } from '../../store/useCockpit';
import { loopClosure } from '../../mirrors/loopClosure';
import { LoopDiagram } from '../loop/LoopDiagram';

// The loop, full-screen. Forward arrows are clickable: flow → slowing → stop. The
// return path is evidence-driven — it closes only when Intent is revised after reality moves.
export function LoopDetail() {
  const versions = useCockpit((s) => s.versions);
  const setMode = useCockpit((s) => s.setMode);
  const lc = loopClosure(versions);

  return (
    <div className="loop-detail">
      <p className="loop-detail-lead">
        Progress flows along an arrow unless something stops it. The loop is <em>closed</em> only when
        the return path — Reality → Intent — flows too. Forward arrows are clickable; the return arrow
        is set by evidence.
      </p>
      <div className={`loop-closure loop-closure-${lc.state}`}>
        <span className="loop-closure-dot" />
        <span className="loop-closure-label">Loop.Closure · {lc.closed ? 'closed' : 'open'}</span>
        <span className="loop-closure-evidence">{lc.evidence}</span>
        {!lc.closed && (
          <button className="loop-closure-act" onClick={() => setMode('author')}>
            revise Intent ›
          </button>
        )}
      </div>
      <div className="loop-detail-canvas">
        <LoopDiagram />
      </div>
      <div className="loop-legend">
        <span><i className="swatch swatch-flow" /> flowing</span>
        <span><i className="swatch swatch-partial" /> slowing</span>
        <span><i className="swatch swatch-stop" /> stopped</span>
      </div>
    </div>
  );
}
