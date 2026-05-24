import type { Challenge, MirrorVerdict } from '../../domain/types';
import { MirrorList } from './MirrorList';
import { ChallengeCard } from './ChallengeCard';
import './patterns.css';

// Right panel: the strategy's own reflection (Mirrors), the freshness finding, and
// the challenge. Sensors stay gated until a v0.1 exists (C1).
export function PatternsPanel({
  gateOpen,
  verdicts,
  staleness,
  challenge,
}: {
  gateOpen: boolean;
  verdicts: MirrorVerdict[];
  staleness: MirrorVerdict;
  challenge: Challenge;
}) {
  return (
    <div className="panel">
      <div>
        <div className="panel-title">Patterns &amp; challenges</div>
        <div className="panel-note">The cockpit turns the ten-quality lens back on the strategy.</div>
      </div>

      <div className="panel-scroll">
        <div className="freshness-finding">{staleness.body}</div>

        <div className="patterns-section-label">Mirrors</div>
        <MirrorList verdicts={verdicts} />

        <div className="patterns-section-label">
          From the sensors
          {!gateOpen && <span className="gated"> · gated until v0.1</span>}
        </div>

        {gateOpen ? (
          <ChallengeCard challenge={challenge} />
        ) : (
          <p className="gated-note">
            Save a v0.1 strategy across the ten qualities to unlock the sensors and their challenges.
            An empty section is allowed — it is itself a finding.
          </p>
        )}
      </div>
    </div>
  );
}
