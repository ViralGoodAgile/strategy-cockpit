import { useMemo } from 'react';
import { useCockpit } from '../../store/useCockpit';
import { strategyTriadViews } from '../../mirrors/strategyTriadView';
import { StrategyTriadChart } from '../sensors/StrategyTriadChart';
import { Instrument } from './Instrument';

// The strategy turned back on itself: four triads covering all ten qualities. The dot
// shows which qualities the strategy leans on and which are thin. Replaces the Mirrors.
export function StrategyTriadsReadout() {
  const draft = useCockpit((s) => s.draft);
  const setDetail = useCockpit((s) => s.setDetail);
  const captured = useCockpit((s) => s.capturedStories);
  const views = useMemo(() => strategyTriadViews(draft), [draft]);
  const capturesFor = (id: string) => captured.filter((c) => c.triadId === id && !c.na);

  return (
    <Instrument label="Strategy triads" sub="ten qualities" area="striads" onExpand={() => setDetail('striads')}>
      <div className="st-grid">
        {views.map((v) => (
          <div className="st-cell" key={v.id}>
            <div className="st-title">{v.title}</div>
            <StrategyTriadChart labels={v.labels} weights={v.weights} captures={capturesFor(v.id)} />
          </div>
        ))}
      </div>
    </Instrument>
  );
}
