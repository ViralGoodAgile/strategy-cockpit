import { useMemo } from 'react';
import { composeChallenges } from '../../challenge/composeChallenge';
import { useCockpit } from '../../store/useCockpit';
import { offsetFromNow } from '../../mirrors/snapshotHistory';
import { PERIODS, periodLabel } from '../../lib/timeTravel';
import { FreshPill } from '../common/Trust';

// The primary challenge as the cockpit's message bar, with a freshness pill for trust
// and a way into the full set when more than one cross-sensor pattern fires. The headline
// challenge follows the dashboard's global as-of (a different pattern was foremost earlier).
export function ChallengeBar() {
  const draft = useCockpit((s) => s.draft);
  const setMode = useCockpit((s) => s.setMode);
  const setDetail = useCockpit((s) => s.setDetail);
  const focusQuality = useCockpit((s) => s.focusQuality);
  const scenario = useCockpit((s) => s.scenario);
  const timeUnit = useCockpit((s) => s.timeUnit);
  const timeIndex = useCockpit((s) => s.timeIndex);

  const challenges = useMemo(() => composeChallenges(draft, scenario), [draft, scenario]);
  if (challenges.length === 0) return null;
  const offset = offsetFromNow(timeIndex, PERIODS - 1);
  const asOf = periodLabel(offset, timeUnit);
  // earlier periods foreground a different challenge from the set
  const c = challenges[offset % challenges.length];

  return (
    <section className="challenge-bar">
      <div className="cb-tag">Challenge · {asOf}</div>
      <p className="cb-q">{c.question}</p>
      <div className="cb-side">
        {c.trendNote && <p className="cb-trend">{c.trendNote}.</p>}
        <div className="cb-refs">
          {c.references.map((r, i) => (
            <button
              key={i}
              className="cb-ref"
              onClick={() => {
                if (r.quality) { focusQuality(r.quality); setMode('author'); }
                if (r.teamId) setDetail('mandate');
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="cb-meta">
          <FreshPill freshness={c.freshness} />
          {challenges.length > 1 && (
            <button className="cb-all" onClick={() => setDetail('challenges')}>
              {challenges.length} challenges ›
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
