import { MANDATE_SIGNAL, actualMedian } from '../../data/synthetic';
import { levelGap } from '../../domain/mandate';
import { useCockpit } from '../../store/useCockpit';
import { FreshnessLine } from '../common/Freshness';
import { Instrument } from './Instrument';

// Glanceable Mandate readout: the gap numerals. Expand for the full A–I ladder.
export function MandateReadout() {
  const setDetail = useCockpit((s) => s.setDetail);
  const teams = MANDATE_SIGNAL.value;
  const gaps = teams
    .map((t) => {
      const m = actualMedian(t);
      return m ? Math.abs(levelGap(t.authorised, m)) : 0;
    })
    .sort((a, b) => a - b);
  const median = gaps[Math.floor((gaps.length - 1) / 2)];
  const max = gaps[gaps.length - 1];
  const over2 = gaps.filter((g) => g >= 2).length;

  return (
    <Instrument
      label="Mandate Levels"
      sub={<FreshnessLine observedAt={MANDATE_SIGNAL.observedAt} freshness={MANDATE_SIGNAL.freshness} prefix="" />}
      area="mandate"
      live={over2 > 0}
      onExpand={() => setDetail('mandate')}
    >
      <div className="readout-3">
        <div className="ro">
          <div className="ro-val num">{median}</div>
          <div className="ro-lab">median gap</div>
        </div>
        <div className="ro">
          <div className="ro-val num">{max}</div>
          <div className="ro-lab">max</div>
        </div>
        <div className="ro">
          <div className={`ro-val num ${over2 ? 'ro-alert' : ''}`}>{over2}</div>
          <div className="ro-lab">teams ≥ 2</div>
        </div>
      </div>
    </Instrument>
  );
}
