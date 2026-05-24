// Core domain types for the cockpit. Each type carries a one-line definition.

// A Cynefin sense-making domain (Snowden); the strategy's Context declares one.
export type CynefinDomain =
  | 'clear'
  | 'complicated'
  | 'complex'
  | 'chaotic'
  | 'confused';

// One of the ten strategic qualities (Scotland / SGEP); the key linking sections, Mirrors and sensors.
export type QualityId =
  | 'intent'
  | 'context'
  | 'focus'
  | 'coherence'
  | 'quantification'
  | 'decisions'
  | 'learning'
  | 'emergence'
  | 'participation'
  | 'durability';

// Gilb Planguage objective: a single measurable strategic objective.
export interface PlanguageEntry {
  id: string;
  gist: string; // prose: what the objective is
  scale: string; // the unit of measure
  meter: string; // how the scale is actually measured
  tolerable: string; // minimum acceptable value
  goal: string; // target value
}

// The authored strategy: prose per quality plus the few structured fields the Mirrors read.
export interface Strategy {
  intent: { text: string };
  context: { text: string; crux: string; cynefin: CynefinDomain | '' };
  focus: { text: string; willNot: string[]; wipCap: number | null };
  coherence: { text: string };
  quantification: { text: string; entries: PlanguageEntry[] };
  decisions: { text: string };
  learning: { text: string };
  emergence: { text: string };
  participation: { text: string; authors: string[]; missingVoices: string[] };
  durability: { text: string; dependsOn: string };
}

// An immutable saved snapshot of the strategy; version like "0.1", savedAt ISO.
export interface StrategyVersion {
  version: string;
  savedAt: string;
  strategy: Strategy;
}

// Freshness verdict for any datum (the crap-in-crap-out guard).
export type Freshness = 'fresh' | 'aging' | 'stale' | 'dead';

// Provenance + freshness envelope wrapping every sensor datum.
export interface Signal<T> {
  value: T;
  source: string; // sensor id or 'synthetic'
  observedAt: string; // ISO: when reality was sampled
  freshness: Freshness;
  synthetic: boolean;
}

// Cutler mandate level: A (build exactly this) .. I (generate a long-term outcome).
export type MandateLevel =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I';

// A unit of work attributed to a team; stream = the kind of work it is.
export interface WorkItem {
  id: string;
  title: string;
  stream: string; // e.g. 'enterprise' | 'core' | 'platform'
  implied: MandateLevel; // mandate level the work itself implies
}

// One observation in a team's mandate time-series (drives trend, not a target).
export interface MandateObservation {
  observedAt: string; // ISO
  actualMedian: MandateLevel; // work-implied median at that time
}

// A synthetic team and its three mandate overlays. Never a named individual.
export interface Team {
  id: string;
  name: string;
  authorised: MandateLevel; // overlay (a): authority granted to the team
  strategyImplied: MandateLevel; // overlay (c): level the strategy implies
  work: WorkItem[]; // overlay (b) source: actual work in flight
  history: MandateObservation[]; // recent actual-median observations, oldest first
}

// Direction of travel for an inspected measure — the cockpit leads with this, not pass/fail.
export interface Trend {
  direction: 'up' | 'down' | 'flat' | 'new';
  detail?: string; // e.g. "40% -> 60%" or "vs v0.2"
}

// A Mirror verdict: an observation or question about the strategy, never a grade.
export interface MirrorVerdict {
  id: string; // e.g. "M-Focus.Discipline"
  quality: QualityId | null; // section it links to (null = a cross-cutting finding)
  title: string;
  body: string;
  kind: 'observation' | 'question';
  trend?: Trend;
}

// An auto-composed challenge: a cross-sensor pattern framed against the strategy.
export interface Challenge {
  id: string;
  title: string;
  question: string;
  references: { label: string; quality?: QualityId; teamId?: string }[];
  source: string; // the sensor the finding rests on (for the trust caveat)
  freshness: Freshness; // freshness of that input — drives how much to trust it
  observedAt: string; // as-of of the data it rests on
  trendNote?: string; // e.g. "and that gap has widened over 3 weeks"
}

// Loop-edge state. Progress flows along an arrow unless something stops it; the loop
// is "closed" only when the return path (Adaptation -> Intent) is also flowing.
// flow = green/animated, partial = amber/slower, stop = red/static.
export type Closure = 'flow' | 'partial' | 'stop';
