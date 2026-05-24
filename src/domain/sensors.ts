import type { QualityId } from './types';

// --- Triad.SenseMaker (qualitative; Cynefin SenseMaker) ---

// One positive pole of a triad. SenseMaker rule: all three poles are desirable (C2).
export interface TriadPole {
  id: string;
  label: string;
  short: string; // a 1-word label for the triangle vertex (keeps it readable)
}

// A story self-signified inside the triad. a/b/c are barycentric weights (sum = 1):
// a -> pole[0] (top), b -> pole[1] (lower-left), c -> pole[2] (lower-right).
export interface TriadStory {
  id: string;
  role: string; // role-level only, never a named individual (C4)
  text: string; // the story precedes the placement (C2)
  a: number;
  b: number;
  c: number;
  period: 'current' | 'prior'; // for centroid-drift trend
}

// A human reading of a triad pattern. SenseMaker is human sense-making — the cockpit
// shows the dots; people interpret them. Never machine-authored, never authoritative.
export interface TriadInterpretation {
  by: string; // role of the interpreter (e.g. "facilitator"), never a named individual
  text: string;
}

// A triad: a question, three positive poles, self-signified stories, human readings.
export interface Triad {
  id: string;
  title: string; // short human label, e.g. "Sense-making"
  question: string;
  poles: [TriadPole, TriadPole, TriadPole];
  stories: TriadStory[];
  interpretations: TriadInterpretation[];
  maps: QualityId[];
}

// A Cynefin SenseMaker signification set — several triads signified together.
export interface TriadSet {
  triads: Triad[];
}

// --- Flow.Insights (quantitative; Kanban Guides) ---

// Aggregate flow state at one point in time.
export interface FlowSnapshot {
  wip: number; // items in progress
  throughput: number; // items completed in the last week
  blocked: number; // currently blocked items
  oldestAgeDays: number; // age-in-state of the oldest in-progress item
}

// Flow insights with short series so the cockpit shows trend, not a target.
export interface FlowInsights {
  current: FlowSnapshot;
  wipSeries: number[]; // oldest -> newest, weekly
  throughputSeries: number[]; // oldest -> newest, weekly
  maps: QualityId[];
}

// --- Flow.Constraint (Theory of Constraints; the time-travel "movie") ---

// A discrete unit of work. type drives its colour in the flow simulation.
export type WorkItemType = 'feature' | 'enterprise' | 'bug' | 'debt';
export interface SimItem {
  id: string;
  type: WorkItemType;
}

// A work-station's contents at one moment: items queued (waiting) vs active (being
// worked, limited by capacity). Active beyond capacity is impossible — surplus queues.
export interface StageState {
  queue: SimItem[];
  active: SimItem[];
}

// One frame of the flow movie: the whole system at a point in time, item by item.
export interface FlowFrame {
  label: string; // e.g. "week 3"
  build: StageState;
  review: StageState;
  done: SimItem[];
  constraint: 'build' | 'review'; // the work-stage with the largest queue (Goldratt)
}

// A replayable, item-level flow history for the Theory-of-Constraints view.
export interface FlowConstraintData {
  caps: { build: number; review: number };
  frames: FlowFrame[]; // oldest -> newest
  maps: QualityId[];
}

// --- DORA + DataDog (quantitative numerals) ---

// A single numeric metric with a prior value for trend. `better` is informational
// only — the cockpit shows direction of travel, not pass/fail.
export interface Metric {
  key: string;
  label: string;
  display: string; // formatted current value, e.g. "2.3 / day"
  value: number; // numeric current
  prior: number; // numeric previous period
  unit: string;
  better: 'higher' | 'lower';
}

// The four DORA numbers, lead-and-lag balanced.
export interface DoraSet {
  metrics: Metric[];
  maps: QualityId[];
}

// DataDog production observability — explicitly a LAG source.
export interface DataDogSet {
  metrics: Metric[];
  lag: true;
  maps: QualityId[];
}

// Production outcomes — changes in PRODUCT metrics (incl. usage telemetry). This is the
// REALITY the loop senses: whether the world is moving toward INTENT.
export interface OutcomeSet {
  metrics: Metric[];
  maps: QualityId[];
}

// --- WeakSignal.Detector (Sens2): behavioural anomalies below routine reporting ---

// A weak signal: a role-level behavioural change (never a named individual, C4).
export interface WeakSignal {
  id: string;
  role: string; // the role whose behaviour changed
  behaviour: string; // the observed change
  sinceWeeks: number; // how long it has persisted
  rising: boolean; // strengthening vs faint
}
export interface WeakSignalSet {
  signals: WeakSignal[];
  maps: QualityId[];
}

// --- Radar.Impediments: a ship's-radar of blockers, ranged by organisational scope ---

// Scope ring: pod (most local) -> function -> org -> super-org (outside the org).
export type ScopeLevel = 'pod' | 'function' | 'org' | 'superorg';
export interface Impediment {
  id: string;
  level: ScopeLevel;
  label: string;
  severity: 'high' | 'med' | 'low';
  angle: number; // 0..360, bearing on the scope ring
}
export interface RadarSet {
  impediments: Impediment[];
  maps: QualityId[];
}

// --- SystemModel.AutoGen (Syn2): a seed Larman/Senge Causal Loop Diagram ---

// A CLD variable (node). x/y are normalised 0..1 positions for layout.
export interface CldVariable {
  id: string;
  label: string;
  x: number;
  y: number;
}
// Every CLD arrow is classed; default is correlation. Causation needs human ratification.
export type LinkKind = 'causation' | 'correlation' | 'hypothesis';
export interface CldLink {
  from: string;
  to: string;
  sign: '+' | '-'; // same-direction (+) or opposite (-)
  kind: LinkKind;
}
// A reinforcing (R) or balancing (B) loop, surfaced for dialogue.
export interface CldLoop {
  id: string;
  type: 'R' | 'B';
  label: string;
  x: number;
  y: number;
}
// The auto-generated system model — a seed for dialogue, not a finding.
export interface SystemModel {
  name: string;
  note: string;
  variables: CldVariable[];
  links: CldLink[];
  loops: CldLoop[];
  maps: QualityId[];
}
