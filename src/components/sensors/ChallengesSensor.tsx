import { composeChallenges } from '../../challenge/composeChallenge';
import { useCockpit } from '../../store/useCockpit';
import { FreshPill, trustNote } from '../common/Trust';

// Challenge.Composer, full: every cross-sensor pattern framed against the strategy,
// each wearing the trust caveat of the data it rests on (hygiene → trust).
export function ChallengesSensor() {
  const draft = useCockpit((s) => s.draft);
  const setMode = useCockpit((s) => s.setMode);
  const setDetail = useCockpit((s) => s.setDetail);
  const focusQuality = useCockpit((s) => s.focusQuality);
  const scenario = useCockpit((s) => s.scenario);
  const challenges = composeChallenges(draft, scenario);

  return (
    <div className="ch-detail">
      <p className="ch-lead">
        Cross-sensor patterns, framed as questions against your strategy. Each is only as trustworthy
        as the signal beneath it — read the pill before you act on the question.
      </p>
      <ul className="ch-list">
        {challenges.map((c) => (
          <li className={`ch-item ${c.freshness !== 'fresh' ? 'ch-item-caveat' : ''}`} key={c.id}>
            <div className="ch-head">
              <span className="ch-title">{c.title}</span>
              <FreshPill freshness={c.freshness} />
            </div>
            <p className="ch-q">{c.question}</p>
            {c.trendNote && <p className="ch-trend">{c.trendNote}.</p>}
            <div className="ch-foot">
              <span className="ch-trust">{trustNote(c.freshness, c.source)}</span>
              <div className="ch-refs">
                {c.references.map((r, i) => (
                  <button
                    key={i}
                    className="ch-ref"
                    onClick={() => {
                      if (r.quality) { focusQuality(r.quality); setMode('author'); }
                      if (r.teamId) setDetail('mandate');
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
