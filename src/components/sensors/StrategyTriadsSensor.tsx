import { strategyTriadViews } from '../../mirrors/strategyTriadView';
import { useCockpit } from '../../store/useCockpit';
import type { Strategy } from '../../domain/types';
import { StrategyTriadChart } from './StrategyTriadChart';

// The full strategy-triads page: the cockpit inspecting its own strategy across all ten
// qualities, as four triads. A Mirror — observations, never grades; one click to Author.
export function StrategyTriadsSensor() {
  const draft = useCockpit((s) => s.draft as Strategy);
  const setMode = useCockpit((s) => s.setMode);
  const captured = useCockpit((s) => s.capturedStories);
  const views = strategyTriadViews(draft);
  const capturesFor = (id: string) => captured.filter((c) => c.triadId === id && !c.na);
  const totalCaptures = views.reduce((n, v) => n + capturesFor(v.id).length, 0);

  return (
    <div className="st-detail">
      <p className="st-lead">
        The same ten-quality lens turned back on your strategy — four triads, all ten qualities. The
        solid dot leans toward what the strategy develops; the far corner is what it neglects.
        {totalCaptures > 0 && (
          <span className="triad-legend">
            {' '}
            Ringed champagne dots are people’s signified stories — the <em>perceived</em> lean against
            the authored one.
          </span>
        )}
      </p>
      <div className="triad-grid">
        {views.map((v) => (
          <div className="triad-chart" key={v.id}>
            <div className="triad-title">{v.title}</div>
            <StrategyTriadChart labels={v.labels} weights={v.weights} captures={capturesFor(v.id)} showStory />
            <p className="triad-lean">
              leans <strong>{v.strong}</strong> · <span className="st-weak">{v.weak}</span> is thin
            </p>
            <div className="triad-interp">
              <div className="triad-interp-head">interpretations · by people, not the cockpit</div>
              {v.interpretations.map((it, i) => (
                <p className="triad-interp-row" key={i}>
                  <span className="triad-interp-by">{it.by}</span>
                  {it.text}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="st-author" onClick={() => setMode('author')}>
        Author the strategy ›
      </button>
    </div>
  );
}
