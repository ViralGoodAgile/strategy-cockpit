import type { CapturedStory, Triad } from '../domain/sensors';

// Fields a survey taker may revise after capture — never the identity/provenance keys.
export type CapturedEdit = Partial<Omit<CapturedStory, 'id' | 'triadId' | 'at'>>;

// Edit a captured story in place, matched by id. Pure: returns a new array; unknown ids
// are a no-op. Used by the store's updateCaptured action and exercised in the BDD specs.
export function updateCapturedIn(
  list: CapturedStory[],
  id: string,
  patch: CapturedEdit,
): CapturedStory[] {
  return list.map((s) => (s.id === id ? { ...s, ...patch } : s));
}

// Remove a captured story by id. Pure: returns a new array; unknown ids are a no-op.
export function removeCapturedFrom(list: CapturedStory[], id: string): CapturedStory[] {
  return list.filter((s) => s.id !== id);
}

// Fold survey-taker captures into the live triads: each CapturedStory becomes a current-
// period TriadStory on its triad, so the cockpit's lean + centroid drift react to real
// signification. Pure — given the same inputs it returns the same merged triads.
export function triadsWithCaptured(triads: Triad[], captured: CapturedStory[]): Triad[] {
  if (captured.length === 0) return triads;
  return triads.map((t) => {
    // "Not applicable" responses are recorded but never plotted as a dot.
    const mine = captured.filter((c) => c.triadId === t.id && !c.na);
    if (mine.length === 0) return t;
    return {
      ...t,
      stories: [
        ...t.stories,
        ...mine.map((c) => ({
          id: c.id,
          role: c.role,
          text: c.text,
          a: c.a,
          b: c.b,
          c: c.c,
          period: 'current' as const,
          captured: true, // a survey taker's own signification — drawn distinctly from seed dots
        })),
      ],
    };
  });
}
