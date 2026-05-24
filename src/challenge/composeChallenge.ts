import type { Challenge, Signal, Strategy, Team } from '../domain/types';
import { MANDATE_LABELS, levelGap, levelIndex } from '../domain/mandate';
import { actualMedian } from '../data/synthetic';

// Count of work items per stream across all teams (overlay (b), aggregated).
function wipByStream(teams: Team[]): { total: number; byStream: Record<string, number> } {
  const byStream: Record<string, number> = {};
  let total = 0;
  for (const t of teams) {
    for (const w of t.work) {
      byStream[w.stream] = (byStream[w.stream] ?? 0) + 1;
      total += 1;
    }
  }
  return { total, byStream };
}

// Describe a team's recent trend from its observation history ("widened over N weeks").
function trendNote(team: Team): string | undefined {
  const h = team.history;
  if (h.length < 2) return undefined;
  const delta = levelIndex(h[h.length - 1].actualMedian) - levelIndex(h[0].actualMedian);
  if (delta > 0) return `and that gap has widened over the last ${h.length - 1} weeks`;
  if (delta < 0) return `though that gap has been narrowing over the last ${h.length - 1} weeks`;
  return undefined;
}

// Compose ONE challenge from the Mandate Levels signal framed against the strategy.
// Strong path: a Focus exclusion that is contradicted by work in flight.
// Fallback: the single largest authorised-vs-actual mandate gap.
export function composeChallenge(
  strategy: Strategy,
  signal: Signal<Team[]>,
): Challenge {
  const teams = signal.value;
  const { total, byStream } = wipByStream(teams);
  const excluded = strategy.focus.willNot.map((x) => x.trim().toLowerCase()).filter(Boolean);

  // Strong path: does excluded work appear in flight?
  for (const ex of excluded) {
    const stream = Object.keys(byStream).find((s) => s.toLowerCase().includes(ex) || ex.includes(s.toLowerCase()));
    if (!stream) continue;
    const count = byStream[stream];
    const pct = Math.round((count / total) * 100);
    const highTeams = teams.filter((t) => {
      const hasStream = t.work.some((w) => w.stream === stream);
      const med = actualMedian(t);
      return hasStream && med != null && levelIndex(med) >= levelIndex('F');
    });
    if (count > 0) {
      const lead = highTeams[0];
      return {
        question: `Your Focus says you will NOT do “${stream}”. Yet ${pct}% of work in flight is ${stream}, and ${highTeams.length} ${highTeams.length === 1 ? 'team is' : 'teams are'} operating at F or above on it. What is true — the strategy, or the work?`,
        references: [
          { label: 'Focus: will-NOT list', quality: 'focus' },
          { label: `Mandate Levels: ${stream} WIP`, teamId: lead?.id },
        ],
        freshness: signal.freshness,
        observedAt: signal.observedAt,
        trendNote: lead ? trendNote(lead) : undefined,
      };
    }
  }

  // Fallback: largest authorised-vs-actual gap.
  let worst: { team: Team; gap: number } | null = null;
  for (const t of teams) {
    const med = actualMedian(t);
    if (!med) continue;
    const gap = levelGap(t.authorised, med);
    if (!worst || Math.abs(gap) > Math.abs(worst.gap)) worst = { team: t, gap };
  }

  if (worst) {
    const med = actualMedian(worst.team)!;
    return {
      question: `${worst.team.name} is authorised at ${worst.team.authorised} (“${MANDATE_LABELS[worst.team.authorised]}”) but its work implies ${med} (“${MANDATE_LABELS[med]}”) — a gap of ${Math.abs(worst.gap)} levels. Does your strategy intend that stretch, or is it drift?`,
      references: [
        { label: 'Decisions / Focus', quality: 'decisions' },
        { label: `Mandate Levels: ${worst.team.name}`, teamId: worst.team.id },
      ],
      freshness: signal.freshness,
      observedAt: signal.observedAt,
      trendNote: trendNote(worst.team),
    };
  }

  return {
    question: 'No mandate data available to challenge the strategy.',
    references: [],
    freshness: signal.freshness,
    observedAt: signal.observedAt,
  };
}
