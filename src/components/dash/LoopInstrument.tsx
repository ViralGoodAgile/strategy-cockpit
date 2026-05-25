import { useCockpit } from '../../store/useCockpit';
import { loopClosure } from '../../mirrors/loopClosure';
import { offsetFromNow } from '../../mirrors/snapshotHistory';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { LoopDiagram } from '../loop/LoopDiagram';

// The loop instrument. The header expands it to a full-screen overlay; the forward arrows
// stay clickable in place. The return arrow is evidence-driven (Loop.Closure) and reads the
// dashboard's global as-of — earlier, the return path hadn't closed yet.
export function LoopInstrument() {
  const setDetail = useCockpit((s) => s.setDetail);
  const versions = useCockpit((s) => s.versions);
  const scenario = useCockpit((s) => s.scenario);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const timeIndex = useCockpit((s) => s.timeIndex);

  const offset = offsetFromNow(timeIndex, PERIODS - 1);
  const asOf = periodLabel(offset, timeUnit);
  const lc = loopClosure(versions, scenario);
  // The loop closes late: at "now" it reads whatever the evidence says; earlier it was open.
  const closed = offset === 0 ? lc.closed : false;
  const state = offset === 0 ? lc.state : 'open';

  return (
    <section className="inst inst-loop" style={{ gridArea: 'loop' }}>
      <header className="inst-head inst-head-click" onClick={() => setDetail('loop')}>
        <span className="inst-label">The loop</span>
        <span className={`inst-sub loop-return loop-return-${state}`}>
          return {closed ? 'closed' : 'open'} · {asOf}
        </span>
        <span className="inst-expand" aria-hidden>›</span>
      </header>
      <div className="inst-body loop-instrument-body">
        <LoopDiagram />
      </div>
    </section>
  );
}
