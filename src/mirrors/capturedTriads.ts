import type { CapturedStory, Triad } from '../domain/sensors';

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
        })),
      ],
    };
  });
}
