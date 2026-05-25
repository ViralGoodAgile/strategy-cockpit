import { GOAL_TREE, type ExperimentStatus } from '../../data/goals';
import { experimentTally } from '../../mirrors/experiments';

const STATUS_LABEL: Record<ExperimentStatus, string> = {
  validated: 'validated',
  invalidated: 'invalidated',
  unsure: 'unsure',
};

// EBM goal ladder + experiment ledger: the Strategic Goal decomposes into Intermediate Goals,
// each pursued through Immediate Tactical Goals run as experiments. Each experiment shows its
// hypothesis, the value-area measure it targets, and a clearly-labelled outcome —
// validated / invalidated / unsure. Lives beside the loop (the empirical engine of the loop).
export function GoalLadder() {
  const g = GOAL_TREE;
  const t = experimentTally(g);

  return (
    <div className="goals">
      <div className="goals-head">
        <span className="goals-title">EBM goals &amp; experiments</span>
        <span className="goals-tally">
          <span className="gx-validated">{t.validated} validated</span> ·{' '}
          <span className="gx-invalidated">{t.invalidated} invalidated</span> ·{' '}
          <span className="gx-unsure">{t.unsure} unsure</span>
        </span>
      </div>

      <div className="goal-strategic">
        <span className="goal-kva">{g.kva}</span>
        <span className="goal-strategic-text">{g.text}</span>
      </div>

      <ol className="goal-intermediates">
        {g.intermediates.map((ig) => (
          <li className="goal-intermediate" key={ig.id}>
            <div className="goal-intermediate-text">{ig.text}</div>
            <ul className="goal-experiments">
              {ig.experiments.map((x) => (
                <li className={`goal-exp goal-exp-${x.status}`} key={x.id}>
                  <div className="goal-exp-row">
                    <span className={`goal-exp-pill gx-${x.status}`}>{STATUS_LABEL[x.status]}</span>
                    <span className="goal-exp-measure">{x.measure}</span>
                  </div>
                  <p className="goal-exp-hyp">{x.hypothesis}</p>
                  <p className="goal-exp-evidence">{x.evidence}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
