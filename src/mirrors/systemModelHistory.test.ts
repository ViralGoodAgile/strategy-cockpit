import { describe, it, expect } from 'vitest';
import { systemModelAt } from './systemModelHistory';
import { SYSTEM_MODEL_SIGNAL } from '../data/sensorData';
import type { SystemModel } from '../domain/sensors';

const models = SYSTEM_MODEL_SIGNAL.value;
const focus = models[2]; // "Focus discipline" — has causation links
const edges = (m: SystemModel) => new Set(m.links.map((l) => `${l.from}->${l.to}`));
const count = (m: SystemModel, kind: string) => m.links.filter((l) => l.kind === kind).length;

describe('systemModelAt', () => {
  it('returns the live model untouched at "now"', () => {
    expect(systemModelAt(focus, 0, 5)).toBe(focus);
  });

  it('has fewer links the further back you look', () => {
    expect(systemModelAt(focus, 5, 5).links.length).toBeLessThan(focus.links.length);
  });

  it('softens confidence earlier: more hypothesis, less causation than now', () => {
    const early = systemModelAt(focus, 5, 5);
    expect(count(early, 'causation')).toBeLessThan(count(focus, 'causation'));
    expect(count(early, 'hypothesis')).toBeGreaterThan(count(systemModelAt(focus, 0, 5), 'hypothesis'));
  });

  it('re-routes a link earlier — an earlier edge the present lacks, and vice versa', () => {
    const early = edges(systemModelAt(focus, 5, 5));
    const now = edges(focus);
    expect([...early].some((e) => !now.has(e))).toBe(true);
    expect([...now].some((e) => !early.has(e))).toBe(true);
  });

  it('a belief since reversed: a sign reads opposite in the older half', () => {
    const tiny: SystemModel = {
      name: 't',
      note: '',
      maps: [],
      variables: [
        { id: 'a', label: 'A', x: 0, y: 0 },
        { id: 'b', label: 'B', x: 0, y: 0 },
        { id: 'c', label: 'C', x: 0, y: 0 },
      ],
      links: [
        { from: 'a', to: 'b', sign: '+', kind: 'causation' },
        { from: 'b', to: 'c', sign: '+', kind: 'causation' },
        { from: 'c', to: 'a', sign: '+', kind: 'causation' },
      ],
      loops: [],
    };
    const early = systemModelAt(tiny, 5, 5);
    expect(early.links.some((l) => l.sign === '-')).toBe(true);
    expect(early.links.every((l) => l.kind !== 'causation')).toBe(true);
  });
});
