import type { Challenge } from '../../domain/types';
import { useCockpit } from '../../store/useCockpit';
import { FreshnessLine } from '../common/Freshness';

// The one auto-composed challenge. References are clickable -> strategy section or
// Mandate team (drilldown <= 2 clicks). Carries its inputs' freshness on its face.
export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const focusQuality = useCockpit((s) => s.focusQuality);
  const selectTeam = useCockpit((s) => s.selectTeam);

  return (
    <div className="challenge">
      <div className="challenge-tag">Challenge</div>
      <p className="challenge-q">{challenge.question}</p>
      {challenge.trendNote && <p className="challenge-trend">{challenge.trendNote}.</p>}

      <div className="challenge-refs">
        {challenge.references.map((r, i) => (
          <button
            key={i}
            className="challenge-ref link"
            onClick={() => {
              if (r.quality) focusQuality(r.quality);
              if (r.teamId) selectTeam(r.teamId);
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="challenge-meta">
        <FreshnessLine
          observedAt={challenge.observedAt}
          freshness={challenge.freshness}
          prefix="rests on Mandate data observed"
        />
      </div>
    </div>
  );
}
