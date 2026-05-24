import type { Signal } from '../../domain/types';
import type { TriadSet } from '../../domain/sensors';
import { useCockpit } from '../../store/useCockpit';
import { triadsWithCaptured } from '../../mirrors/capturedTriads';
import { SensorModule } from './SensorModule';
import { TriadChart } from './TriadChart';

// Mean-weight lean: which pole a triad's stories sit nearest, in a period.
function leanIndex(stories: { a: number; b: number; c: number; period: string }[], period: string) {
  const r = stories.filter((s) => s.period === period);
  const m = r.reduce((o, s) => ({ a: o.a + s.a, b: o.b + s.b, c: o.c + s.c }), { a: 0, b: 0, c: 0 });
  return [m.a, m.b, m.c].indexOf(Math.max(m.a, m.b, m.c));
}

// Triad.SenseMaker — the full Cynefin signification set: three triangles with their
// findings. Stories self-signified by role (never named individuals, C4).
export function TriadSensor({ signal }: { signal: Signal<TriadSet> }) {
  const captured = useCockpit((s) => s.capturedStories);
  const triads = triadsWithCaptured(signal.value.triads, captured);
  const total = triads.reduce((n, t) => n + t.stories.filter((s) => s.period === 'current').length, 0);

  return (
    <SensorModule
      name="Triad.SenseMaker"
      number={1}
      maps={['context', 'learning', 'participation']}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={
        <>
          {triads.length} Cynefin triads · {total} stories self-signified by role.
          {signal.freshness !== 'fresh' && (
            <em className="sensor-warn"> Signal is {signal.freshness} — a quiet triad may mean nothing happened, or that no one is collecting stories.</em>
          )}
        </>
      }
    >
      <div className="triad-grid">
        {triads.map((t) => {
          const now = leanIndex(t.stories, 'current');
          const before = leanIndex(t.stories, 'prior');
          return (
            <div className="triad-chart" key={t.id}>
              <div className="triad-title">{t.title}</div>
              <p className="triad-q">{t.question}</p>
              <TriadChart triad={t} />
              <p className="triad-lean">
                leans <strong>“{t.poles[now].label}”</strong>
                {now !== before && <> · drifted from “{t.poles[before].label}”</>}
              </p>
              <div className="triad-interp">
                <div className="triad-interp-head">interpretations · by people, not the cockpit</div>
                {t.interpretations.map((it, i) => (
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
    </SensorModule>
  );
}
