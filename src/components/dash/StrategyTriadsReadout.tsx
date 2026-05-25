import { useMemo } from 'react';
import { useCockpit } from '../../store/useCockpit';
import { strategyTriadViews } from '../../mirrors/strategyTriadView';
import { weightsAtPeriod } from '../../mirrors/strategyTriadHistory';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { StrategyTriadChart } from '../sensors/StrategyTriadChart';
import { Instrument } from './Instrument';

// The strategy turned back on itself: four triads covering all ten qualities. The dot shows
// which qualities the strategy leans on, as of the dashboard's global as-of (the lean
// sharpens over time). Survey takers' perceived-lean dots show at "now".
export function StrategyTriadsReadout() {
  const draft = useCockpit((s) => s.draft);
  const setDetail = useCockpit((s) => s.setDetail);
  const captured = useCockpit((s) => s.capturedStories);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const timeIndex = useCockpit((s) => s.timeIndex);
  const views = useMemo(() => strategyTriadViews(draft), [draft]);

  const last = PERIODS - 1;
  const atNow = timeIndex === last;
  const asOf = periodLabel(last - timeIndex, timeUnit);
  const capturesFor = (id: string) => (atNow ? captured.filter((c) => c.triadId === id && !c.na) : []);

  return (
    <Instrument
      label="Strategy triads"
      sub={`ten qualities · ${asOf}`}
      area="striads"
      onExpand={() => setDetail('striads')}
    >
      <div className="st-grid">
        {views.map((v) => (
          <div className="st-cell" key={v.id}>
            <div className="st-title">{v.title}</div>
            <StrategyTriadChart
              labels={v.labels}
              weights={weightsAtPeriod(v.weights, timeIndex, last)}
              captures={capturesFor(v.id)}
            />
          </div>
        ))}
      </div>
    </Instrument>
  );
}
