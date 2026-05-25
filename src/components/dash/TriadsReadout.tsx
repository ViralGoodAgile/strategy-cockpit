import { TRIAD_SIGNAL } from '../../data/sensorData';
import type { Triad } from '../../domain/sensors';
import { useCockpit } from '../../store/useCockpit';
import { triadsWithCaptured } from '../../mirrors/capturedTriads';
import { triadAtPeriod, triadHistory } from '../../mirrors/triadHistory';
import { PERIODS } from '../../lib/timeTravel';
import { TriadChart } from '../sensors/TriadChart';
import { Instrument } from './Instrument';

// Mean-weight lean: which pole index a triad's stories sit nearest, in a period.
function leanIndex(triad: Triad, period: 'current' | 'prior'): number {
  const rows = triad.stories.filter((s) => s.period === period);
  const m = rows.reduce((o, s) => ({ a: o.a + s.a, b: o.b + s.b, c: o.c + s.c }), { a: 0, b: 0, c: 0 });
  return [m.a, m.b, m.c].indexOf(Math.max(m.a, m.b, m.c));
}

// Glanceable triad readout: one clear sense-making triangle + the headline finding. Follows
// the dashboard's global as-of; expand for the full movie of all three triads.
export function TriadsReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const captured = useCockpit((s) => s.capturedStories);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const timeIndex = useCockpit((s) => s.timeIndex);

  const base = TRIAD_SIGNAL.value.triads[0];
  const history = triadHistory(base, PERIODS, timeUnit);
  const sense = triadAtPeriod(base, history, timeIndex, (b) => triadsWithCaptured([b], captured)[0]);
  const asOf = history[timeIndex].label;
  const now = leanIndex(sense, 'current');
  const before = leanIndex(sense, 'prior');
  const hasPrior = sense.stories.some((s) => s.period === 'prior');
  const drifted = hasPrior && now !== before;

  return (
    <Instrument
      label="Cynefin triads"
      sub={`sense-making · ${asOf}`}
      area="triads"
      live={drifted}
      onExpand={() => setDetail('triads')}
    >
      <div className="tr-read">
        <div className="tr-chart">
          <TriadChart triad={sense} showStory={false} />
        </div>
        <p className="tr-finding">
          leans <strong>“{sense.poles[now].short}”</strong>
          {drifted && <> · drifted from “{sense.poles[before].short}”</>}
        </p>
      </div>
    </Instrument>
  );
}
