import { useCockpit } from '../../store/useCockpit';
import { loopClosure } from '../../mirrors/loopClosure';
import { LoopDiagram } from '../loop/LoopDiagram';

// The loop instrument. The header expands it to a full-screen overlay; the forward
// arrows stay clickable in place. The return arrow is evidence-driven (Loop.Closure).
export function LoopInstrument() {
  const setDetail = useCockpit((s) => s.setDetail);
  const versions = useCockpit((s) => s.versions);
  const scenario = useCockpit((s) => s.scenario);
  const lc = loopClosure(versions, scenario);

  return (
    <section className="inst inst-loop" style={{ gridArea: 'loop' }}>
      <header className="inst-head inst-head-click" onClick={() => setDetail('loop')}>
        <span className="inst-label">The loop</span>
        <span className={`inst-sub loop-return loop-return-${lc.state}`}>
          return {lc.closed ? 'closed' : 'open'}
        </span>
        <span className="inst-expand" aria-hidden>›</span>
      </header>
      <div className="inst-body loop-instrument-body">
        <LoopDiagram />
      </div>
    </section>
  );
}
