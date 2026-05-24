import type { MandateObservation, Signal, Team } from '../domain/types';
import { medianLevel } from '../domain/mandate';
import { freshnessOf, WEEKLY_CADENCE } from '../lib/freshness';

// ISO timestamp for N days before now (synthetic data is dated relative to load).
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// A short, dated time-series of work-implied medians so the cockpit can show a TREND.
function series(weeks: MandateObservation['actualMedian'][]): MandateObservation[] {
  return weeks.map((actualMedian, i) => ({
    observedAt: daysAgo((weeks.length - 1 - i) * 7 + 11),
    actualMedian,
  }));
}

// Synthetic teams. Roles/teams/work only — never named individuals (C11).
// Designed so MandateLevels has teeth: at least one gap >= 2, one widening trend,
// and enterprise work in flight to challenge a "no enterprise" Focus.
const TEAMS: Team[] = [
  {
    id: 'atlas',
    name: 'Team Atlas',
    authorised: 'C', // told: problem framed, choose how
    strategyImplied: 'D',
    work: [
      { id: 'a1', title: 'Enterprise SSO rollout', stream: 'enterprise', implied: 'G' },
      { id: 'a2', title: 'Tenant isolation hardening', stream: 'enterprise', implied: 'F' },
      { id: 'a3', title: 'Audit-log export', stream: 'enterprise', implied: 'F' },
    ],
    history: series(['E', 'F', 'F', 'G']), // drifting UP — widening gap
  },
  {
    id: 'beacon',
    name: 'Team Beacon',
    authorised: 'E',
    strategyImplied: 'E',
    work: [
      { id: 'b1', title: 'Onboarding redesign', stream: 'core', implied: 'E' },
      { id: 'b2', title: 'Activation experiment', stream: 'core', implied: 'E' },
    ],
    history: series(['E', 'E', 'E', 'E']), // aligned, flat
  },
  {
    id: 'cinder',
    name: 'Team Cinder',
    authorised: 'C',
    strategyImplied: 'F',
    work: [
      { id: 'c1', title: 'Build pipeline migration', stream: 'platform', implied: 'D' },
      { id: 'c2', title: 'Observability baseline', stream: 'platform', implied: 'E' },
    ],
    history: series(['C', 'D', 'D', 'E']), // drifting up
  },
  {
    id: 'delta',
    name: 'Team Delta',
    authorised: 'D',
    strategyImplied: 'D',
    work: [
      { id: 'd1', title: 'Billing reliability', stream: 'core', implied: 'E' },
      { id: 'd2', title: 'Enterprise SLA dashboard', stream: 'enterprise', implied: 'F' },
    ],
    history: series(['D', 'D', 'E', 'E']),
  },
];

// The Mandate Levels sensor signal: synthetic, observed 11 days ago -> AGING on purpose,
// so the cockpit visibly carries a freshness caveat (crap-in-crap-out made real).
export const MANDATE_SIGNAL: Signal<Team[]> = {
  value: TEAMS,
  source: 'synthetic',
  observedAt: daysAgo(11),
  freshness: freshnessOf(daysAgo(11), WEEKLY_CADENCE),
  synthetic: true,
};

// Current work-implied median for a team (overlay (b)).
export function actualMedian(team: Team) {
  return medianLevel(team.work.map((w) => w.implied));
}
