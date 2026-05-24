import type {
  Backlog,
  CldVariable,
  DataDogSet,
  DoraSet,
  FlowConstraintData,
  FlowFrame,
  FlowInsights,
  OutcomeSet,
  RadarSet,
  ReliabilitySet,
  SimItem,
  SystemModel,
  Triad,
  TriadSet,
  WeakSignalSet,
  WorkItemType,
} from '../domain/sensors';
import type { Signal } from '../domain/types';
import { freshnessOf, WEEKLY_CADENCE } from '../lib/freshness';

// ISO timestamp N days before now.
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// Wrap a synthetic value in a Signal envelope with computed freshness.
function synthetic<T>(value: T, ageDays: number, source: string): Signal<T> {
  return {
    value,
    source,
    observedAt: daysAgo(ageDays),
    freshness: freshnessOf(daysAgo(ageDays), WEEKLY_CADENCE),
    synthetic: true,
  };
}

// --- Triad.SenseMaker (Cynefin signification set). Three triads signified together.
// All poles positive; the respondent places the dot (C2). Stale on purpose (40 days)
// to show a present-but-stale qualitative sensor as a finding.
const TRIAD_SET: TriadSet = {
  triads: [
    {
      // The canonical Cynefin sensing triad: probe (Complex) / analyse (Complicated) /
      // best-practice (Clear). Drift away from probing in a Complex context is a finding.
      id: 'sensemaking',
      title: 'Sense-making',
      question: 'When we hit something unfamiliar, our first move was to…',
      poles: [
        { id: 'probe', label: 'Probe & experiment', short: 'Probe' },
        { id: 'analyse', label: 'Analyse & consult', short: 'Analyse' },
        { id: 'practice', label: 'Apply proven practice', short: 'Practice' },
      ],
      maps: ['context', 'emergence', 'learning'],
      interpretations: [
        { by: 'facilitator', text: 'We default to analysis even when the context is genuinely novel — worth asking which of these were actually complex, not complicated.' },
        { by: 'engineering lead', text: 'The probing stories were all small bets that paid off. We may be under-probing.' },
      ],
      stories: [
        { id: 's1', role: 'PM', text: 'New segment behaviour — we ran a small experiment.', a: 0.7, b: 0.2, c: 0.1, period: 'current' },
        { id: 's2', role: 'engineer', text: 'Perf regression — analysed traces with an expert.', a: 0.1, b: 0.8, c: 0.1, period: 'current' },
        { id: 's3', role: 'designer', text: 'Onboarding confusion — followed our usual playbook.', a: 0.1, b: 0.2, c: 0.7, period: 'current' },
        { id: 's4', role: 'engineer', text: 'Outage — analysed root cause methodically.', a: 0.1, b: 0.85, c: 0.05, period: 'current' },
        { id: 's5', role: 'PM', text: 'Pricing — we A/B probed two options.', a: 0.7, b: 0.2, c: 0.1, period: 'current' },
        { id: 's6', role: 'support', text: 'Ticket spike — applied standard responses.', a: 0.1, b: 0.25, c: 0.65, period: 'current' },
        { id: 's7', role: 'engineer', text: 'Unclear requirement — analysed an options doc.', a: 0.15, b: 0.75, c: 0.1, period: 'current' },
        { id: 'sp1', role: 'PM', text: 'Earlier: we probed before deciding.', a: 0.7, b: 0.2, c: 0.1, period: 'prior' },
        { id: 'sp2', role: 'designer', text: 'Earlier: small experiments were the norm.', a: 0.65, b: 0.2, c: 0.15, period: 'prior' },
        { id: 'sp3', role: 'engineer', text: 'Earlier: we prototyped to learn.', a: 0.6, b: 0.25, c: 0.15, period: 'prior' },
      ],
    },
    {
      // Single- vs double-loop learning.
      id: 'learning',
      title: 'Learning',
      question: 'When the team learned something new, it most changed…',
      poles: [
        { id: 'belief', label: 'What we believe', short: 'Believe' },
        { id: 'action', label: 'What we do', short: 'Do' },
        { id: 'plan', label: 'What we plan', short: 'Plan' },
      ],
      maps: ['learning', 'participation'],
      interpretations: [
        { by: 'facilitator', text: 'Most learning changes what we do, not what we believe — single-loop dominates. Where is the double-loop?' },
        { by: 'product', text: 'The belief-shift stories all came from outside-in research, not internal debate.' },
      ],
      stories: [
        { id: 'l1', role: 'engineer', text: 'A reliability incident changed our deploy checklist.', a: 0.1, b: 0.75, c: 0.15, period: 'current' },
        { id: 'l2', role: 'designer', text: 'User tests showed our onboarding model was wrong; we rethought the frame.', a: 0.7, b: 0.15, c: 0.15, period: 'current' },
        { id: 'l3', role: 'PM', text: 'A segment churns early, so we re-sequenced the roadmap.', a: 0.15, b: 0.2, c: 0.65, period: 'current' },
        { id: 'l4', role: 'engineer', text: 'A flaky test taught us to tweak CI retries.', a: 0.05, b: 0.85, c: 0.1, period: 'current' },
        { id: 'l5', role: 'support', text: 'Repeated tickets made us adjust a help doc.', a: 0.1, b: 0.8, c: 0.1, period: 'current' },
        { id: 'l6', role: 'PM', text: 'Win/loss review shifted what we believe about our buyer.', a: 0.6, b: 0.1, c: 0.3, period: 'current' },
        { id: 'l7', role: 'designer', text: 'A workaround users invented changed a screen.', a: 0.1, b: 0.7, c: 0.2, period: 'current' },
        { id: 'lp1', role: 'designer', text: 'Earlier: research overturned an assumption.', a: 0.7, b: 0.1, c: 0.2, period: 'prior' },
        { id: 'lp2', role: 'PM', text: 'Earlier: an offsite changed convictions.', a: 0.65, b: 0.15, c: 0.2, period: 'prior' },
        { id: 'lp3', role: 'engineer', text: 'Earlier: a post-mortem changed how we think about risk.', a: 0.55, b: 0.25, c: 0.2, period: 'prior' },
      ],
    },
    {
      // Whose voice shaped the work — participation.
      id: 'voice',
      title: 'Voice',
      question: 'This work was shaped most by…',
      poles: [
        { id: 'team', label: 'The team’s voice', short: 'Team' },
        { id: 'data', label: 'The data', short: 'Data' },
        { id: 'customer', label: 'The customer’s voice', short: 'Customer' },
      ],
      maps: ['participation', 'intent'],
      interpretations: [
        { by: 'facilitator', text: 'Data is steering. The customer’s voice shows up mostly via complaints, not foresight.' },
      ],
      stories: [
        { id: 'v1', role: 'PM', text: 'Roadmap set by dashboard metrics.', a: 0.1, b: 0.8, c: 0.1, period: 'current' },
        { id: 'v2', role: 'designer', text: 'Customer interviews drove the work.', a: 0.15, b: 0.15, c: 0.7, period: 'current' },
        { id: 'v3', role: 'engineer', text: 'Team consensus in planning decided it.', a: 0.7, b: 0.2, c: 0.1, period: 'current' },
        { id: 'v4', role: 'PM', text: 'Metrics decided priority.', a: 0.1, b: 0.8, c: 0.1, period: 'current' },
        { id: 'v5', role: 'support', text: 'Customer complaints shaped it.', a: 0.1, b: 0.2, c: 0.7, period: 'current' },
        { id: 'v6', role: 'engineer', text: 'A team retro decided the change.', a: 0.65, b: 0.2, c: 0.15, period: 'current' },
        { id: 'vp1', role: 'PM', text: 'Earlier: data led most calls.', a: 0.2, b: 0.6, c: 0.2, period: 'prior' },
        { id: 'vp2', role: 'PM', text: 'Earlier: dashboards drove priority.', a: 0.15, b: 0.7, c: 0.15, period: 'prior' },
        { id: 'vp3', role: 'designer', text: 'Earlier: metrics outweighed voices.', a: 0.2, b: 0.65, c: 0.15, period: 'prior' },
      ],
    },
  ],
};

// --- Flow.Insights: WIP trending up, throughput variable. Aging (9 days).
const FLOW: FlowInsights = {
  current: { wip: 11, throughput: 6, blocked: 3, oldestAgeDays: 34 },
  wipSeries: [6, 7, 7, 9, 11], // climbing
  throughputSeries: [8, 5, 9, 4, 6], // variable
  maps: ['quantification', 'focus', 'decisions'],
};

// --- Flow.Constraint: a deterministic item-level simulation. Items arrive into Build,
// flow Build -> Review -> Done; each station has an active capacity, surplus queues.
// Build cap 3 outpaces Review cap 2, so the constraint shifts to Review and its queue
// balloons while throughput holds ~steady — the constraint paces the system (Goldratt).
const ARRIVALS: Record<number, WorkItemType[]> = {
  1: ['feature', 'enterprise', 'feature', 'bug'],
  2: ['enterprise', 'feature', 'debt', 'enterprise'],
  3: ['feature', 'bug', 'enterprise'],
  4: ['feature', 'debt'],
  5: ['enterprise', 'feature'],
  6: ['bug'],
  7: ['feature'],
};

function simulateFlow(): FlowConstraintData {
  const caps = { build: 3, review: 2 };
  let buildQ: SimItem[] = [];
  let buildA: SimItem[] = [];
  let reviewQ: SimItem[] = [];
  let reviewA: SimItem[] = [];
  const done: SimItem[] = [];
  let seq = 0;
  const frames: FlowFrame[] = [];

  for (let w = 1; w <= 8; w++) {
    // 1. completions: items active last week finish and advance.
    reviewA.forEach((i) => done.push(i));
    reviewA = [];
    reviewQ.push(...buildA);
    buildA = [];
    // 2. arrivals enter the Build queue.
    (ARRIVALS[w] ?? []).forEach((type) => buildQ.push({ id: `wi${++seq}`, type }));
    // 3. pulls: fill active slots from upstream queues, up to capacity.
    while (buildA.length < caps.build && buildQ.length) buildA.push(buildQ.shift()!);
    while (reviewA.length < caps.review && reviewQ.length) reviewA.push(reviewQ.shift()!);
    // 4. constraint = the work-stage with the largest queue.
    const constraint = reviewQ.length > buildQ.length ? 'review' : 'build';
    frames.push({
      label: `week ${w}`,
      build: { queue: [...buildQ], active: [...buildA] },
      review: { queue: [...reviewQ], active: [...reviewA] },
      done: [...done],
      constraint,
    });
  }
  return { caps, frames, maps: ['quantification', 'focus', 'decisions'] };
}

const FLOW_CONSTRAINT = simulateFlow();

// --- Backlog: the queue behind the flow. Zombies (untouched 22–90d) and fossils (90d+)
// inflate age-in-state and make a WIP cap meaningless. Pruning them is a flow practice.
export const BACKLOG: Backlog = {
  maps: ['focus', 'quantification', 'decisions'],
  items: [
    { id: 'bk1', type: 'feature', age: 4 },
    { id: 'bk2', type: 'feature', age: 9 },
    { id: 'bk3', type: 'enterprise', age: 14 },
    { id: 'bk4', type: 'bug', age: 3 },
    { id: 'bk5', type: 'feature', age: 38 },
    { id: 'bk6', type: 'enterprise', age: 52 },
    { id: 'bk7', type: 'debt', age: 71 },
    { id: 'bk8', type: 'feature', age: 19 },
    { id: 'bk9', type: 'bug', age: 44 },
    { id: 'bk10', type: 'enterprise', age: 118 },
    { id: 'bk11', type: 'debt', age: 140 },
    { id: 'bk12', type: 'feature', age: 7 },
    { id: 'bk13', type: 'feature', age: 88 },
    { id: 'bk14', type: 'debt', age: 96 },
  ],
};

// --- DORA: lead/lag balanced. Fresh (2 days).
const DORA: DoraSet = {
  maps: ['quantification'],
  metrics: [
    { key: 'deployFreq', label: 'Deploy frequency', display: '2.3 / day', value: 2.3, prior: 1.8, unit: '/day', better: 'higher', series: [1.5, 1.7, 1.6, 1.9, 1.8, 2.3] },
    // Lead time: the run is improving (38h → 31h) even though the last point ticked up.
    { key: 'leadTime', label: 'Lead time for changes', display: '31 h', value: 31, prior: 27, unit: 'h', better: 'lower', series: [38, 35, 33, 30, 27, 31] },
    { key: 'changeFail', label: 'Change failure rate', display: '14 %', value: 14, prior: 18, unit: '%', better: 'lower', series: [22, 20, 19, 18, 18, 14] },
    { key: 'mttr', label: 'Mean time to restore', display: '4.2 h', value: 4.2, prior: 5.1, unit: 'h', better: 'lower', series: [6.0, 5.6, 5.3, 5.0, 5.1, 4.2] },
  ],
};

// --- DataDog: production lag metrics. Freshest (today).
const DATADOG: DataDogSet = {
  lag: true,
  maps: ['quantification'],
  metrics: [
    // p95: the run is down (430ms → 412ms) despite a worse last point — don't react to the tick.
    { key: 'p95', label: 'p95 latency', display: '412 ms', value: 412, prior: 388, unit: 'ms', better: 'lower', series: [430, 420, 405, 395, 388, 412] },
    { key: 'errorRate', label: 'Error rate', display: '0.7 %', value: 0.7, prior: 0.9, unit: '%', better: 'lower', series: [1.2, 1.0, 0.95, 0.9, 0.9, 0.7] },
    { key: 'uptime', label: 'Uptime (30d)', display: '99.94 %', value: 99.94, prior: 99.9, unit: '%', better: 'higher', series: [99.85, 99.88, 99.9, 99.92, 99.9, 99.94] },
  ],
};

// --- WeakSignal.Detector: role-level behavioural anomalies (never named people, C4).
const WEAK: WeakSignalSet = {
  maps: ['emergence', 'focus', 'participation'],
  signals: [
    { id: 'w1', role: 'launch-leader', behaviour: 'stopped attending the launch review', sinceWeeks: 3, rising: true },
    { id: 'w2', role: 'two delivery teams', behaviour: 'retro language shifted from “we” to “they”', sinceWeeks: 2, rising: true },
    { id: 'w3', role: 'on-call', behaviour: 'silently absorbing overflow from Review (unlogged)', sinceWeeks: 4, rising: false },
    { id: 'w4', role: 'platform', behaviour: 'design-review attendance dropped to zero', sinceWeeks: 2, rising: false },
  ],
};

// --- SystemModel.AutoGen: FIVE seed CLDs drafted from sensor data, switchable. Default
// link class is correlation; causation would need named human ratification. R/B surfaced.
// Lay variables on a ring (top, clockwise) so any model reads as a clean polygon.
function ring(vars: { id: string; label: string }[]): CldVariable[] {
  const n = vars.length;
  return vars.map((v, i) => {
    const a = -Math.PI / 2 + (i / n) * 2 * Math.PI;
    return { ...v, x: 0.5 + 0.4 * Math.cos(a), y: 0.5 + 0.42 * Math.sin(a) };
  });
}

const SYSTEM_MODELS: SystemModel[] = [
  {
    name: 'Delivery pressure',
    note: 'WIP outpaces Review; pressure breeds shortcuts that feed the queue (R). Safety dampens WIP (B).',
    maps: ['quantification', 'decisions', 'focus'],
    variables: ring([
      { id: 'wip', label: 'WIP' },
      { id: 'queue', label: 'Review queue' },
      { id: 'lead', label: 'Lead time' },
      { id: 'pressure', label: 'Pressure' },
      { id: 'shortcuts', label: 'Shortcuts' },
      { id: 'safety', label: 'Psych safety' },
    ]),
    links: [
      { from: 'wip', to: 'queue', sign: '+', kind: 'correlation' },
      { from: 'queue', to: 'lead', sign: '+', kind: 'correlation' },
      { from: 'lead', to: 'pressure', sign: '+', kind: 'hypothesis' },
      { from: 'pressure', to: 'shortcuts', sign: '+', kind: 'hypothesis' },
      { from: 'shortcuts', to: 'queue', sign: '+', kind: 'hypothesis' },
      { from: 'pressure', to: 'safety', sign: '-', kind: 'hypothesis' },
      { from: 'safety', to: 'wip', sign: '-', kind: 'correlation' },
    ],
    loops: [
      { id: 'r1', type: 'R', label: 'pressure→shortcuts→queue', x: 0.62, y: 0.5 },
      { id: 'b1', type: 'B', label: 'safety dampens WIP', x: 0.3, y: 0.32 },
    ],
  },
  {
    name: 'Safety & learning',
    note: 'Candour surfaces problems, feeding learning, decision quality and trust — a reinforcing loop. Pressure can break it.',
    maps: ['participation', 'learning'],
    variables: ring([
      { id: 'safety', label: 'Psych safety' },
      { id: 'candour', label: 'Candour' },
      { id: 'problems', label: 'Problems surfaced' },
      { id: 'learning', label: 'Learning' },
      { id: 'decisions', label: 'Decision quality' },
      { id: 'trust', label: 'Trust' },
    ]),
    links: [
      { from: 'safety', to: 'candour', sign: '+', kind: 'correlation' },
      { from: 'candour', to: 'problems', sign: '+', kind: 'correlation' },
      { from: 'problems', to: 'learning', sign: '+', kind: 'hypothesis' },
      { from: 'learning', to: 'decisions', sign: '+', kind: 'hypothesis' },
      { from: 'decisions', to: 'trust', sign: '+', kind: 'hypothesis' },
      { from: 'trust', to: 'safety', sign: '+', kind: 'correlation' },
    ],
    loops: [{ id: 'r1', type: 'R', label: 'candour→learning→trust', x: 0.5, y: 0.5 }],
  },
  {
    name: 'Focus discipline',
    note: 'Saying yes raises WIP and context-switching, lengthening lead time — which invites more yes (R). A WIP cap balances it (B).',
    maps: ['focus', 'decisions'],
    variables: ring([
      { id: 'opps', label: 'Opportunities' },
      { id: 'yes', label: 'Yes-to-more' },
      { id: 'wip', label: 'WIP' },
      { id: 'switch', label: 'Context-switching' },
      { id: 'lead', label: 'Lead time' },
      { id: 'cap', label: 'WIP cap' },
    ]),
    links: [
      { from: 'opps', to: 'yes', sign: '+', kind: 'correlation' },
      { from: 'yes', to: 'wip', sign: '+', kind: 'causation' },
      { from: 'wip', to: 'switch', sign: '+', kind: 'correlation' },
      { from: 'switch', to: 'lead', sign: '+', kind: 'hypothesis' },
      { from: 'lead', to: 'yes', sign: '+', kind: 'hypothesis' },
      { from: 'cap', to: 'wip', sign: '-', kind: 'causation' },
    ],
    loops: [
      { id: 'r1', type: 'R', label: 'yes→WIP→lead→yes', x: 0.55, y: 0.5 },
      { id: 'b1', type: 'B', label: 'cap holds WIP', x: 0.32, y: 0.7 },
    ],
  },
  {
    name: 'Loop closure',
    note: 'The strategic loop itself: reality → sensors → patterns → learning → intent → action → reality. Closed = reinforcing.',
    maps: ['learning', 'intent', 'emergence'],
    variables: ring([
      { id: 'reality', label: 'Reality' },
      { id: 'sensors', label: 'Sensors' },
      { id: 'patterns', label: 'Patterns' },
      { id: 'learning', label: 'Learning' },
      { id: 'intent', label: 'Intent' },
      { id: 'action', label: 'Action' },
    ]),
    links: [
      { from: 'reality', to: 'sensors', sign: '+', kind: 'correlation' },
      { from: 'sensors', to: 'patterns', sign: '+', kind: 'correlation' },
      { from: 'patterns', to: 'learning', sign: '+', kind: 'hypothesis' },
      { from: 'learning', to: 'intent', sign: '+', kind: 'hypothesis' },
      { from: 'intent', to: 'action', sign: '+', kind: 'causation' },
      { from: 'action', to: 'reality', sign: '+', kind: 'causation' },
    ],
    loops: [{ id: 'r1', type: 'R', label: 'the closing loop', x: 0.5, y: 0.5 }],
  },
  {
    name: 'Mandate alignment',
    note: 'When work demands a higher mandate than teams hold, the gap creates friction that saps throughput and re-raises ambition.',
    maps: ['decisions', 'participation', 'coherence'],
    variables: ring([
      { id: 'ambition', label: 'Strategy ambition' },
      { id: 'work', label: 'Work mandate' },
      { id: 'authorised', label: 'Authorised mandate' },
      { id: 'gap', label: 'Mandate gap' },
      { id: 'friction', label: 'Friction' },
      { id: 'throughput', label: 'Throughput' },
    ]),
    links: [
      { from: 'ambition', to: 'work', sign: '+', kind: 'hypothesis' },
      { from: 'work', to: 'gap', sign: '+', kind: 'correlation' },
      { from: 'authorised', to: 'gap', sign: '-', kind: 'correlation' },
      { from: 'gap', to: 'friction', sign: '+', kind: 'hypothesis' },
      { from: 'friction', to: 'throughput', sign: '-', kind: 'hypothesis' },
      { from: 'throughput', to: 'ambition', sign: '-', kind: 'hypothesis' },
    ],
    loops: [{ id: 'b1', type: 'B', label: 'gap throttles throughput', x: 0.5, y: 0.5 }],
  },
];

// --- Radar.Impediments: blockers ranged by scope. Center = most local (pod), outer
// edge = outside the organisation (super-org). Roles/scopes only, never named people.
const RADAR: RadarSet = {
  maps: ['focus', 'decisions', 'coherence', 'emergence'],
  impediments: [
    { id: 'i1', level: 'pod', label: 'Review WIP over cap', severity: 'high', angle: 35 },
    { id: 'i2', level: 'pod', label: 'Flaky CI gating merges', severity: 'med', angle: 165 },
    { id: 'i3', level: 'function', label: 'Design-review attendance collapsed', severity: 'high', angle: 300 },
    { id: 'i4', level: 'function', label: 'Definition-of-Done drift across teams', severity: 'med', angle: 95 },
    { id: 'i5', level: 'org', label: 'No double-loop learning cadence', severity: 'high', angle: 215 },
    { id: 'i6', level: 'org', label: 'Mandate gap: teams 2+ levels over', severity: 'med', angle: 340 },
    { id: 'i7', level: 'superorg', label: 'Regulatory change pending', severity: 'high', angle: 130 },
    { id: 'i8', level: 'superorg', label: 'Market consolidating on enterprise', severity: 'med', angle: 25 },
  ],
};

// --- Product outcomes: is the product moving customers' world toward intent? Seen
// through the PIRATE funnel (AARRR) and experience quality (HEART), plus the customer's
// own voice (a Cynefin sense-making triad) and the demand still open (unserved jobs).
// Fresh (telemetry arrives quickly); strategy is the slowest thing to react.

// Customer sense-making — a Cynefin SenseMaker triad. Three positive poles (all good,
// C2); stories self-signified at SEGMENT level, never named individuals (C4). The drift
// is the finding: customers used to talk about delight; on re-entry they now talk friction.
const CUSTOMER_TRIAD: Triad = {
  id: 'customer-value',
  title: 'Customer sense-making',
  question: 'When the product helped you most, it was because it…',
  poles: [
    { id: 'friction', label: 'Removed friction', short: 'Friction-free' },
    { id: 'delight', label: 'Sparked delight', short: 'Delight' },
    { id: 'confidence', label: 'Built confidence', short: 'Confidence' },
  ],
  maps: ['intent', 'learning', 'participation'],
  interpretations: [
    { by: 'customer researcher', text: 'Delight clusters on first-run; on re-entry the stories slide toward friction — exactly the gap the unserved jobs target.' },
    { by: 'support lead', text: 'Confidence shows up when hand-offs are visible. Its absence arrives as a complaint, never as a request.' },
  ],
  stories: [
    { id: 'cu1', role: 'onboarding teams', text: 'Set up faster than we expected — no call needed.', a: 0.7, b: 0.2, c: 0.1, period: 'current' },
    { id: 'cu2', role: 'returning users', text: 'Took a while to see what had changed since last week.', a: 0.55, b: 0.1, c: 0.35, period: 'current' },
    { id: 'cu3', role: 'power users', text: 'The new flow felt delightful once I found it.', a: 0.15, b: 0.7, c: 0.15, period: 'current' },
    { id: 'cu4', role: 'cross-team hand-offs', text: 'I could not prove the work landed without chasing.', a: 0.5, b: 0.1, c: 0.4, period: 'current' },
    { id: 'cu5', role: 'evaluators', text: 'The first artefact made the value obvious.', a: 0.2, b: 0.65, c: 0.15, period: 'current' },
    { id: 'cu6', role: 'admins', text: 'Trusted the numbers once freshness was visible.', a: 0.2, b: 0.15, c: 0.65, period: 'current' },
    { id: 'cp1', role: 'onboarding teams', text: 'Earlier: delight on first run dominated.', a: 0.2, b: 0.65, c: 0.15, period: 'prior' },
    { id: 'cp2', role: 'returning users', text: 'Earlier: fewer friction stories on re-entry.', a: 0.3, b: 0.5, c: 0.2, period: 'prior' },
    { id: 'cp3', role: 'power users', text: 'Earlier: stories clustered on delight.', a: 0.15, b: 0.7, c: 0.15, period: 'prior' },
  ],
};

const OUTCOMES: OutcomeSet = {
  maps: ['intent', 'quantification', 'learning'],
  // PIRATE / AARRR — the growth funnel, acquisition through revenue.
  aarrr: [
    { key: 'acq', label: 'Acquisition · new workspaces / wk', display: '142', value: 142, prior: 118, unit: '', better: 'higher', series: [96, 108, 115, 120, 118, 142] },
    { key: 'act', label: 'Activation · reached first artefact', display: '64 %', value: 64, prior: 57, unit: '%', better: 'higher', series: [48, 52, 55, 58, 57, 64] },
    { key: 'ret', label: 'Retention · 30-day', display: '62 %', value: 62, prior: 58, unit: '%', better: 'higher', series: [55, 57, 59, 61, 58, 62] },
    { key: 'ref', label: 'Referral · invite k-factor', display: '0.38', value: 0.38, prior: 0.29, unit: '', better: 'higher', series: [0.22, 0.26, 0.3, 0.31, 0.29, 0.38] },
    { key: 'rev', label: 'Revenue · net revenue retention', display: '112 %', value: 112, prior: 104, unit: '%', better: 'higher', series: [98, 101, 103, 106, 104, 112] },
  ],
  // HEART — experience quality. Retention is the shared anchor with AARRR (shown in both
  // lenses on purpose: the frameworks overlap there).
  heart: [
    { key: 'hap', label: 'Happiness · CSAT', display: '4.3 / 5', value: 4.3, prior: 4.1, unit: '', better: 'higher', series: [3.9, 4.0, 4.2, 4.1, 4.1, 4.3] },
    // Engagement: the last point ticked up, but the run is sliding (0.52 → 0.46) — the
    // prominent signal arrow points down; don't celebrate the latest bar.
    { key: 'eng', label: 'Engagement · DAU/WAU stickiness', display: '0.46', value: 0.46, prior: 0.41, unit: '', better: 'higher', series: [0.52, 0.5, 0.48, 0.44, 0.41, 0.46] },
    { key: 'ado', label: 'Adoption · new-collab', display: '21 %', value: 21, prior: 12, unit: '%', better: 'higher', series: [6, 9, 11, 13, 12, 21] },
    { key: 'hret', label: 'Retention · 30-day (shared)', display: '62 %', value: 62, prior: 58, unit: '%', better: 'higher', series: [55, 57, 59, 61, 58, 62] },
    { key: 'tsk', label: 'Task success · completion', display: '88 %', value: 88, prior: 83, unit: '%', better: 'higher', series: [78, 80, 82, 84, 83, 88] },
  ],
  customerTriad: CUSTOMER_TRIAD,
  // Prioritised-but-unserved CUSTOMER jobs-to-be-done — the demand the strategy has
  // chosen to pursue next. These are the customer's jobs in their own situation (Christensen
  // "When… I want… so I can…"), never our internal/team jobs; evidence is customer-derived
  // (research, win/loss, customer behaviour). Ranked, jobs not features. (C4: situations.)
  jobs: [
    {
      id: 'j1',
      rank: 1,
      job: 'When I join a project that is already moving, I want to see where it stands and what is mine, so I can contribute on day one without pulling a teammate away.',
      evidence: '12 of 18 onboarding interviews named “someone had to walk me through it” as the first-week blocker.',
    },
    {
      id: 'j2',
      rank: 2,
      job: 'When I come back after time away, I want to see what changed and what now needs me, so I can pick back up without re-reading everything.',
      evidence: 'Returning-customer sessions open with 3+ minutes of orientation before the first meaningful action.',
    },
    {
      id: 'j3',
      rank: 3,
      job: 'When I hand work to another team, I want to know it landed and is moving, so I can let it go without chasing a status update.',
      evidence: 'Recurring in win/loss notes: “I never really know if the other side picked it up.”',
    },
    {
      id: 'j4',
      rank: 4,
      job: 'When updates are scattered across tools, I want one place I can trust to tell me what is true now, so I can decide without second-guessing the data.',
      evidence: 'Customers who agree “I trust what I see here” retain 1.7× longer — yet trust is the lowest-scoring survey item.',
    },
  ],
};

// --- Reliability: the production/operational SUBSET of product outcomes. Trend, not SLA
// pass/fail (MTTR 52m → 38m). Freshest of all — monitoring streams in near-real-time.
const RELIABILITY: ReliabilitySet = {
  maps: ['durability', 'quantification'],
  metrics: [
    { key: 'up', label: 'Uptime · 30-day', display: '99.95 %', value: 99.95, prior: 99.91, unit: '%', better: 'higher', series: [99.82, 99.86, 99.9, 99.93, 99.91, 99.95] },
    { key: 'mttr', label: 'MTTR', display: '38 min', value: 38, prior: 52, unit: ' min', better: 'lower', series: [70, 62, 55, 48, 52, 38] },
    { key: 'inc', label: 'Incidents / wk', display: '1.2', value: 1.2, prior: 1.8, unit: '', better: 'lower', series: [2.6, 2.2, 1.9, 1.6, 1.8, 1.2] },
    { key: 'err', label: 'Error rate', display: '0.21 %', value: 0.21, prior: 0.34, unit: '%', better: 'lower', series: [0.5, 0.42, 0.38, 0.3, 0.34, 0.21] },
  ],
};

// Exported signals with deliberately varied freshness to exercise the layer.
export const OUTCOMES_SIGNAL: Signal<OutcomeSet> = synthetic(OUTCOMES, 1, 'synthetic'); // fresh
export const RELIABILITY_SIGNAL: Signal<ReliabilitySet> = synthetic(RELIABILITY, 0, 'synthetic'); // freshest
export const WEAK_SIGNAL: Signal<WeakSignalSet> = synthetic(WEAK, 5, 'synthetic'); // aging
export const SYSTEM_MODEL_SIGNAL: Signal<SystemModel[]> = synthetic(SYSTEM_MODELS, 6, 'synthetic'); // aging
export const RADAR_SIGNAL: Signal<RadarSet> = synthetic(RADAR, 3, 'synthetic'); // fresh-ish
export const TRIAD_SIGNAL: Signal<TriadSet> = synthetic(TRIAD_SET, 40, 'synthetic'); // stale
export const FLOW_SIGNAL: Signal<FlowInsights> = synthetic(FLOW, 9, 'synthetic'); // aging
export const FLOW_CONSTRAINT_SIGNAL: Signal<FlowConstraintData> = synthetic(FLOW_CONSTRAINT, 9, 'synthetic'); // aging
export const DORA_SIGNAL: Signal<DoraSet> = synthetic(DORA, 2, 'synthetic'); // fresh
export const DATADOG_SIGNAL: Signal<DataDogSet> = synthetic(DATADOG, 0, 'synthetic'); // fresh
