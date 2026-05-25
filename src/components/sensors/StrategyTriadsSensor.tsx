import { strategyTriadViews } from '../../mirrors/strategyTriadView';
import { useCockpit } from '../../store/useCockpit';
import type { Strategy } from '../../domain/types';
import { leanAtPeriod, weightsAtPeriod } from '../../mirrors/strategyTriadHistory';
import { interpretationsAt } from '../../mirrors/snapshotHistory';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { useTimeTravel } from '../common/useTimeTravel';
import { Transport } from '../common/Transport';
import { StrategyTriadChart } from './StrategyTriadChart';

// The full strategy-triads page as a time-travel movie: the cockpit inspecting its own
// strategy across all ten qualities, scrubbing how its lean formed over time. The solid dot
// is the authored lean; ringed dots (at "now") are people's perceived lean.
export function StrategyTriadsSensor() {
  const draft = useCockpit((s) => s.draft as Strategy);
  const setMode = useCockpit((s) => s.setMode);
  const captured = useCockpit((s) => s.capturedStories);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const views = strategyTriadViews(draft);
  const tt = useTimeTravel(PERIODS);
  const atNow = tt.index === tt.last;
  const asOf = periodLabel(tt.last - tt.index, timeUnit);
  const capturesFor = (id: string) => (atNow ? captured.filter((c) => c.triadId === id && !c.na) : []);
  const totalCaptures = views.reduce((n, v) => n + capturesFor(v.id).length, 0);

  return (
    <div className="st-detail">
      <p className="st-lead">
        The same ten-quality lens turned back on your strategy — four triads, all ten qualities, as
        of <strong>{asOf}</strong>. The solid dot leans toward what the strategy develops; the far
        corner is what it neglects. Scrub or play to watch the lean form.
        {totalCaptures > 0 && (
          <span className="triad-legend">
            {' '}
            Ringed champagne dots are people’s signified stories — the <em>perceived</em> lean against
            the authored one.
          </span>
        )}
      </p>
      <Transport tt={tt} label={asOf} granularity />
      <div className="triad-grid">
        {views.map((v) => {
          const weights = weightsAtPeriod(v.weights, tt.index, tt.last);
          const { strong, weak } = leanAtPeriod(weights);
          return (
            <div className="triad-chart" key={v.id}>
              <div className="triad-title">{v.title}</div>
              <StrategyTriadChart
                labels={v.labels}
                weights={weights}
                captures={capturesFor(v.id)}
                showStory
                onInspect={() => tt.setPlaying(false)}
              />
              <p className="triad-lean">
                leans <strong>{v.labels[strong]}</strong> · <span className="st-weak">{v.labels[weak]}</span> is thin
              </p>
              <div className="triad-interp">
                <div className="triad-interp-head">interpretations · by people, not the cockpit</div>
                {interpretationsAt(v.interpretations, tt.index, tt.last).map((it, i) => (
                  <p className="triad-interp-row" key={i}>
                    <span className="triad-interp-by">{it.by}</span>
                    {it.text}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <button className="st-author" onClick={() => setMode('author')}>
        Author the strategy ›
      </button>
    </div>
  );
}
