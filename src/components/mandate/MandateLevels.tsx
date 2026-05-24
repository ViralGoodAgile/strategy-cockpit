import type { MandateLevel, Signal, Team } from '../../domain/types';
import {
  MANDATE_LABELS,
  MANDATE_ORDER,
  levelGap,
  levelIndex,
} from '../../domain/mandate';
import { actualMedian } from '../../data/synthetic';
import { useCockpit } from '../../store/useCockpit';
import './mandate.css';

const W = 640;
const H = 322;
const PLOT_TOP = 26;
const PLOT_BOTTOM = 296;
const PLOT_LEFT = 46;
const PLOT_RIGHT = 620;

// y-position for a mandate level (I at top, A at bottom).
function levelY(l: MandateLevel): number {
  const idx = levelIndex(l);
  return PLOT_BOTTOM - (idx / 8) * (PLOT_BOTTOM - PLOT_TOP);
}

// Net direction of a team's recent work-implied median (for the trend caret).
function trendCaret(team: Team): string {
  const h = team.history;
  if (h.length < 2) return '';
  const d = levelIndex(h[h.length - 1].actualMedian) - levelIndex(h[0].actualMedian);
  return d > 0 ? '↑' : d < 0 ? '↓' : '';
}

// The A–I ladder with three overlays per team and a gap indicator. SVG, not React
// Flow — a vertical scale chart reads far cleaner hand-drawn (see report note).
export function MandateLevels({ signal }: { signal: Signal<Team[]> }) {
  const teams = signal.value;
  const selected = useCockpit((s) => s.selectedTeam);
  const selectTeam = useCockpit((s) => s.selectTeam);

  const colX = (i: number) =>
    PLOT_LEFT + (i + 0.5) * ((PLOT_RIGHT - PLOT_LEFT) / teams.length);

  // Q14 gap summary: distance authorised -> actual, per team.
  const gaps = teams
    .map((t) => {
      const m = actualMedian(t);
      return m ? Math.abs(levelGap(t.authorised, m)) : 0;
    })
    .sort((a, b) => a - b);
  const medianGap = gaps.length ? gaps[Math.floor((gaps.length - 1) / 2)] : 0;
  const maxGap = gaps.length ? gaps[gaps.length - 1] : 0;
  const overTwo = gaps.filter((g) => g >= 2).length;

  const selectedTeam = teams.find((t) => t.id === selected) ?? null;

  return (
    <div className="mandate">
      <svg viewBox={`0 0 ${W} ${H}`} className="mandate-svg" role="img">
        {/* level gridlines + letters; full meaning on hover (declutters the axis) */}
        {MANDATE_ORDER.map((lvl) => {
          const y = levelY(lvl);
          return (
            <g key={lvl}>
              <title>{`${lvl} — ${MANDATE_LABELS[lvl]}`}</title>
              <line x1={PLOT_LEFT} y1={y} x2={PLOT_RIGHT} y2={y} className="m-grid" />
              <text x={8} y={y + 4} className="m-axis-letter num">{lvl}</text>
            </g>
          );
        })}

        {teams.map((t, i) => {
          const x = colX(i);
          const m = actualMedian(t)!;
          const gap = Math.abs(levelGap(t.authorised, m));
          const big = gap >= 2;
          const on = selected === t.id;
          const aY = levelY(t.authorised);
          const bY = levelY(m);
          const cY = levelY(t.strategyImplied);
          return (
            <g key={t.id} className={`m-team ${on ? 'm-team-on' : ''}`} onClick={() => selectTeam(on ? null : t.id)}>
              {/* gap bracket: authorised -> actual */}
              <line x1={x + 11} y1={aY} x2={x + 11} y2={bY} className={`m-gap ${big ? 'm-gap-big' : ''}`} />
              {gap > 0 && (
                <text x={x + 16} y={(aY + bY) / 2 + 3} className={`m-gap-num num ${big ? 'm-gap-num-big' : ''}`}>
                  {gap}
                </text>
              )}
              {/* overlay (c): strategy-implied — a tick */}
              <line x1={x - 9} y1={cY} x2={x + 9} y2={cY} className="m-strategy" />
              {/* overlay (a): authorised — hollow circle */}
              <circle cx={x} cy={aY} r={5.5} className="m-authorised" />
              {/* overlay (b): actual — filled circle (accent if big gap) */}
              <circle cx={x} cy={bY} r={5.5} className={`m-actual ${big ? 'm-actual-big' : ''}`} />
              {/* trend caret near actual */}
              <text x={x + 12} y={bY - 6} className="m-trend">{trendCaret(t)}</text>
              {/* team name */}
              <text x={x} y={PLOT_BOTTOM + 26} className={`m-team-name ${on ? 'm-team-name-on' : ''}`}>
                {t.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="m-caption">A build-to-spec → I long-term outcome · hover a row for each level</div>

      <div className="m-legend">
        <span><i className="m-key m-key-auth" /> authorised</span>
        <span><i className="m-key m-key-actual" /> actual (work)</span>
        <span><i className="m-key m-key-strategy" /> strategy-implied</span>
      </div>

      <div className="m-summary">
        <span className="num">{medianGap}</span> median gap ·
        <span className="num"> {maxGap}</span> max ·
        <span className="num"> {overTwo}</span> team(s) ≥ 2 steps
      </div>

      {selectedTeam && (
        <div className="m-drill">
          <div className="m-drill-head">
            {selectedTeam.name} — work in flight ({selectedTeam.work.length})
            <button className="link" onClick={() => selectTeam(null)}>close</button>
          </div>
          <ul className="m-drill-list">
            {selectedTeam.work.map((w) => (
              <li key={w.id}>
                <span className="m-drill-title">{w.title}</span>
                <span className="m-drill-meta">{w.stream} · implies {w.implied}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
