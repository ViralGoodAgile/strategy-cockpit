import type { QualityId, Strategy } from './types';

// Static metadata for the ten strategic qualities (Scotland, SGEP).
export interface QualityMeta {
  id: QualityId;
  n: number; // 1..10, authoring order
  name: string;
  prompt: string; // the authoring question (spec F0)
  mirror: string; // the Mirror id this quality produces (spec F1)
}

export const QUALITIES: QualityMeta[] = [
  {
    id: 'intent',
    n: 1,
    name: 'Intent',
    prompt: 'What future are we trying to create, and why?',
    mirror: 'M-Intent.Clarity',
  },
  {
    id: 'context',
    n: 2,
    name: 'Context',
    prompt: 'Diagnosis of the Crux; Cynefin domain; the environment that constrains us.',
    mirror: 'M-Context.Specificity',
  },
  {
    id: 'focus',
    n: 3,
    name: 'Focus',
    prompt: 'Where we will play / where we will NOT play; the strategic WIP cap.',
    mirror: 'M-Focus.Discipline',
  },
  {
    id: 'coherence',
    n: 4,
    name: 'Coherence',
    prompt: 'Trade-offs that hang together; what reinforces what; contradictions surfaced.',
    mirror: 'M-Coherence.Contradiction',
  },
  {
    id: 'quantification',
    n: 5,
    name: 'Quantification',
    prompt: 'Planguage entries (Scale / Meter / Tolerable / Goal) for each objective.',
    mirror: 'M-Quantification.Reality',
  },
  {
    id: 'decisions',
    n: 6,
    name: 'Decisions',
    prompt: 'Explicit do / don’t-do criteria for daily choices.',
    mirror: 'M-Decisions.Operability',
  },
  {
    id: 'learning',
    n: 7,
    name: 'Learning',
    prompt: 'Single-loop (adjust action) and double-loop (question belief) loops; cadence; who learns from whom.',
    mirror: 'M-Learning.Loops',
  },
  {
    id: 'emergence',
    n: 8,
    name: 'Emergence',
    prompt: 'What we let surface; probe-sense-respond posture; how we act on weak signals.',
    mirror: 'M-Emergence.Readiness',
  },
  {
    id: 'participation',
    n: 9,
    name: 'Participation',
    prompt: 'Whose voices shape the strategy; the psychological-safety conditions required.',
    mirror: 'M-Participation.Reach',
  },
  {
    id: 'durability',
    n: 10,
    name: 'Durability',
    prompt: 'How this survives leadership change; what is institutional vs personality-dependent.',
    mirror: 'M-Durability.Heroism',
  },
];

// A blank strategy: every section present (C1 gate), every field empty.
export function emptyStrategy(): Strategy {
  return {
    intent: { text: '' },
    context: { text: '', crux: '', cynefin: '' },
    focus: { text: '', willNot: [], wipCap: null },
    coherence: { text: '' },
    quantification: { text: '', entries: [] },
    decisions: { text: '' },
    learning: { text: '' },
    emergence: { text: '' },
    participation: { text: '', authors: [], missingVoices: [] },
    durability: { text: '', dependsOn: '' },
  };
}
