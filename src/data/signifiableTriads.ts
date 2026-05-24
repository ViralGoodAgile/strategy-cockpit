import { OUTCOMES_SIGNAL, TRIAD_SIGNAL } from './sensorData';
import { STRATEGY_TRIADS } from './strategyTriads';
import { QUALITIES } from '../domain/qualities';
import type { QualityId } from '../domain/types';

// Where a triad comes from — used only to group the /signify picker.
export type TriadCategory = 'cynefin' | 'customer' | 'strategy';

export const TRIAD_CATEGORY_LABEL: Record<TriadCategory, string> = {
  cynefin: 'Cynefin · sense-making',
  customer: 'Customer',
  strategy: 'Strategy on itself',
};

// The minimal shape /signify needs to capture a story onto any triad. The three poles are
// in [top, lower-left, lower-right] order, so a single barycentric placement (a,b,c) maps
// to every triad identically — capture is the same gesture everywhere.
export interface SignifiableTriad {
  id: string;
  title: string;
  question: string;
  poles: [string, string, string];
  category: TriadCategory;
}

const qualityName = (id: QualityId) => QUALITIES.find((q) => q.id === id)?.name ?? id;

// A story must clear a low bar before it's worth signifying (filters empty/accidental entries).
export const MIN_STORY_LEN = 10;

// SenseMaker discipline: a signification needs BOTH a real narrative AND a free placement —
// unless the respondent abstains ("not applicable"), which is always allowed. Story-first,
// so the dot reflects a told experience, not an opinion typed to fit a chosen spot.
export function signifyReady(opts: { na: boolean; text: string; placed: boolean }): boolean {
  return opts.na || (opts.text.trim().length >= MIN_STORY_LEN && opts.placed);
}

// A SenseMaker prompt is about a lived moment, not an opinion: the respondent tells a story
// first, then signifies it. Strategy triads share one such prompt across their three
// qualities (the qualities are the poles).
const STRATEGY_PROMPT =
  'Recall a recent moment this strategy showed up in your work — it leaned most on…';

// Every triad a survey taker can signify: the three Cynefin triads, the customer's voice,
// and the four strategy-on-itself triads. All eight ids are distinct, so captures never
// cross-contaminate.
export function signifiableTriads(): SignifiableTriad[] {
  const cynefin: SignifiableTriad[] = TRIAD_SIGNAL.value.triads.map((t) => ({
    id: t.id,
    title: t.title,
    question: t.question,
    poles: [t.poles[0].short, t.poles[1].short, t.poles[2].short],
    category: 'cynefin',
  }));

  const c = OUTCOMES_SIGNAL.value.customerTriad;
  const customer: SignifiableTriad = {
    id: c.id,
    title: c.title,
    question: c.question,
    poles: [c.poles[0].short, c.poles[1].short, c.poles[2].short],
    category: 'customer',
  };

  const strategy: SignifiableTriad[] = STRATEGY_TRIADS.map((t) => ({
    id: t.id,
    title: t.title,
    question: STRATEGY_PROMPT,
    poles: [qualityName(t.qualities[0]), qualityName(t.qualities[1]), qualityName(t.qualities[2])],
    category: 'strategy',
  }));

  return [...cynefin, customer, ...strategy];
}

// Segments, never named individuals (C4). The default list lives in ./segments and seeds
// the store, where the /signify role picker reads it (and the user can edit it).
export { DEFAULT_SEGMENTS as SEGMENTS } from './segments';
