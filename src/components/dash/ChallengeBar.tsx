import { useMemo } from 'react';
import { composeChallenges } from '../../challenge/composeChallenge';
import { useCockpit } from '../../store/useCockpit';
import { FreshPill } from '../common/Trust';

// The primary challenge as the cockpit's message bar, with a freshness pill for trust
// and a way into the full set when more than one cross-sensor pattern fires.
export function ChallengeBar() {
  const draft = useCockpit((s) => s.draft);
  const setMode = useCockpit((s) => s.setMode);
  const setDetail = useCockpit((s) => s.setDetail);
  const focusQuality = useCockpit((s) => s.focusQuality);
  const scenario = useCockpit((s) => s.scenario);

  const challenges = useMemo(() => composeChallenges(draft, scenario), [draft, scenario]);
  const c = challenges[0];
  if (!c) return null;

  return (
    <section className="challenge-bar">
      <div className="cb-tag">Challenge</div>
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
