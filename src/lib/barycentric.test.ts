import { describe, it, expect } from 'vitest';
import { pointToBarycentric } from './barycentric';

// The triad geometry used across the cockpit (TriadChart): A=top, B=lower-left, C=lower-right.
const A = { x: 120, y: 22 };
const B = { x: 30, y: 184 };
const C = { x: 210, y: 184 };

const near = (x: number, y: number) => Math.abs(x - y) < 0.02;

describe('pointToBarycentric', () => {
  it('a point on a vertex weights ~1 to that pole', () => {
    expect(near(pointToBarycentric(A, A, B, C).a, 1)).toBe(true);
    expect(near(pointToBarycentric(B, A, B, C).b, 1)).toBe(true);
    expect(near(pointToBarycentric(C, A, B, C).c, 1)).toBe(true);
  });

  it('the centroid weights ~1/3 each', () => {
    const centroid = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
    const w = pointToBarycentric(centroid, A, B, C);
    expect(near(w.a, 1 / 3) && near(w.b, 1 / 3) && near(w.c, 1 / 3)).toBe(true);
  });

  it('always returns weights summing to 1, even for points outside the triangle', () => {
    const w = pointToBarycentric({ x: -500, y: -500 }, A, B, C);
    expect(near(w.a + w.b + w.c, 1)).toBe(true);
    expect(w.a >= 0 && w.b >= 0 && w.c >= 0).toBe(true);
  });
});
