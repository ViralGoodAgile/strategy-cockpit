import { useMemo } from 'react';
import { composeChallenge } from '../../challenge/composeChallenge';
import { MANDATE_SIGNAL } from '../../data/synthetic';
import { useCockpit } from '../../store/useCockpit';
import { FreshnessLine } from '../common/Freshness';

// The challenge as the cockpit's primary message bar — the live provocation, framed
// against the strategy, wearing its inputs' freshness on its face.
export function ChallengeBar() {
  const draft = useCockpit((s) => s.draft);
  const setMode = useCockpit((s) => s.setMode);
  const setDetail = useCockpit((s) => s.setDetail);
  const focusQuality = useCockpit((s) => s.focusQuality);

  const challenge = useMemo(() => composeChallenge(draft, MANDATE_SIGNAL), [draft]);

  return (
    <section className="challenge-bar">
      <div className="cb-tag">Challenge</div>
      <p className="cb-q">{challenge.question}</p>
      <div className="cb-side">
        {challenge.trendNote && <p className="cb-trend">{challenge.trendNote}.</p>}
        <div className="cb-refs">
          {challenge.references.map((r, i) => (
            <button
              key={i}
              className="cb-ref"
              onClick={() => {
                if (r.quality) {
                  focusQuality(r.quality);
                  setMode('author');
                }
                if (r.teamId) setDetail('mandate');
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
        <FreshnessLine
          observedAt={challenge.observedAt}
          freshness={challenge.freshness}
          prefix="rests on Mandate data"
        />
      </div>
    </section>
  );
}
