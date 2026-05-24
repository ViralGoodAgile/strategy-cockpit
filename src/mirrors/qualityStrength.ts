import type { QualityId, Strategy } from '../domain/types';

// Word count of a prose field.
function words(s: string): number {
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}
const cap = (n: number) => Math.min(1, Math.max(0, n));

// How developed each strategic quality is in the current draft, 0..1. Used to place
// the dot in each strategy triad — the cockpit inspecting its own strategy (a Mirror).
export function qualityStrength(s: Strategy): Record<QualityId, number> {
  const q = s.quantification;
  const full = q.entries.filter((e) => e.scale && e.meter && e.tolerable && e.goal).length;
  const learn = s.learning.text.toLowerCase();
  const doubleLoop = /\b(assumption|belief|question|why|challenge|wrong)\b/.test(learn);
  const dec = s.decisions.text.toLowerCase();
  const operable = /\b(not|don'?t|never|avoid|over|instead)\b/.test(dec);

  return {
    intent: cap(words(s.intent.text) / 40),
    context: cap(words(s.context.text) / 30) * 0.5 + (s.context.crux ? 0.25 : 0) + (s.context.cynefin ? 0.25 : 0),
    focus: cap(words(s.focus.text) / 25) * 0.5 + (s.focus.willNot.length ? 0.3 : 0) + (s.focus.wipCap != null ? 0.2 : 0),
    coherence: cap(words(s.coherence.text) / 30),
    quantification: (q.entries.length ? (full / q.entries.length) * 0.6 : 0) + cap(words(q.text) / 20) * 0.4,
    decisions: cap(words(s.decisions.text) / 30) * 0.7 + (operable ? 0.3 : 0),
    learning: cap(words(s.learning.text) / 30) * 0.6 + (doubleLoop ? 0.4 : 0),
    emergence: cap(words(s.emergence.text) / 30),
    participation: cap(words(s.participation.text) / 25) * 0.5 + (s.participation.authors.length ? 0.3 : 0) + (s.participation.missingVoices.length ? 0.2 : 0),
    durability: cap(words(s.durability.text) / 30) * 0.7 + (s.durability.dependsOn ? 0.3 : 0),
  };
}
