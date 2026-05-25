import { useMemo } from 'react';
import type { Signal } from '../../domain/types';
import type { TriadSet, TriadStory } from '../../domain/sensors';
import { useCockpit } from '../../store/useCockpit';
import { triadsWithCaptured } from '../../mirrors/capturedTriads';
import { triadAtPeriod, triadHistory } from '../../mirrors/triadHistory';
import { interpretationsAt } from '../../mirrors/snapshotHistory';
import { driftVector, isBimodal, outlierIds } from '../../mirrors/triadShape';
import { PERIODS } from '../../lib/timeTravel';
import { useGlobalTime } from '../common/useGlobalTime';
import { Transport } from '../common/Transport';
import { SensorModule } from './SensorModule';
import { TriadChart } from './TriadChart';

// Mean-weight lean: which pole a triad's stories sit nearest, in a period.
function leanIndex(stories: TriadStory[], period: string) {
  const r = stories.filter((s) => s.period === period);
  const m = r.reduce((o, s) => ({ a: o.a + s.a, b: o.b + s.b, c: o.c + s.c }), { a: 0, b: 0, c: 0 });
  return [m.a, m.b, m.c].indexOf(Math.max(m.a, m.b, m.c));
}

// Triad.SenseMaker — the full Cynefin signification set as a time-travel movie: scrub or
// play through periods to watch the dispositional drift. Stories self-signified by role
// (never named individuals, C4); your own captures appear at "now", ringed.
export function TriadSensor({ signal }: { signal: Signal<TriadSet> }) {
  const captured = useCockpit((s) => s.capturedStories);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const triads = signal.value.triads;
  const histories = useMemo(() => triads.map((t) => triadHistory(t, PERIODS, timeUnit)), [triads, timeUnit]);
  const tt = useGlobalTime();
  const atNow = tt.index === tt.last;
  const asOf = histories[0]?.[tt.index]?.label ?? 'now';

  const total = triads.reduce(
    (n, _t, i) => n + histories[i][tt.index].stories.length,
    0,
  );

  return (
    <SensorModule
      name="Triad.SenseMaker"
      number={1}
      maps={['context', 'learning', 'participation']}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={
        <>
          {triads.length} Cynefin triads · self-signified by role · <strong>{asOf}</strong>: {total} stories.
          Scrub or play to watch the dispositional drift.
          {atNow && captured.length > 0 && (
            <span className="triad-legend"> Your {captured.filter((c) => !c.na).length} signified {captured.filter((c) => !c.na).length === 1 ? 'story is' : 'stories are'} ringed in champagne.</span>
          )}
        </>
      }
    >
      <Transport tt={tt} label={asOf} granularity />
      <div className="triad-grid">
        {triads.map((t, i) => {
          const rt = triadAtPeriod(t, histories[i], tt.index, (base) => triadsWithCaptured([base], captured)[0]);
          const now = leanIndex(rt.stories, 'current');
          const cur = rt.stories.filter((s) => s.period === 'current');
          const pri = rt.stories.filter((s) => s.period === 'prior');
          const drift = driftVector(pri, cur);
          const split = isBimodal(cur);
          const outs = outlierIds(cur).size;
          return (
            <div className="triad-chart" key={t.id}>
              <div className="triad-title">{t.title}</div>
              <p className="triad-q">{t.question}</p>
              <TriadChart triad={rt} onInspect={() => tt.setPlaying(false)} />
              <p className="triad-lean">
                leans <strong>“{t.poles[now].label}”</strong>
                {drift && drift.significant && (
                  <> · drifted {drift.magnitude > 0.3 ? 'strongly' : 'clearly'} toward “{t.poles[drift.toward].label}”</>
                )}
                {drift && !drift.significant && <> · steady (no significant shift)</>}
              </p>
              {(split || outs > 0) && (
                <p className="triad-shape">
                  {split && 'split distribution — the average sits in an empty middle'}
                  {split && outs > 0 && ' · '}
                  {outs > 0 && `${outs} outlier${outs > 1 ? 's' : ''} worth reading`}
                </p>
              )}
              <div className="triad-interp">
                <div className="triad-interp-head">interpretations · by people, not the cockpit</div>
                {interpretationsAt(t.interpretations, tt.index, tt.last).map((it, j) => (
                  <p className="triad-interp-row" key={j}>
                    <span className="triad-interp-by">{it.by}</span>
                    {it.text}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </SensorModule>
  );
}
