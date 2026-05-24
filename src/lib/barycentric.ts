// Convert a point inside a triangle to barycentric weights (a, b, c) summing to 1, where
// a → vertex A, b → vertex B, c → vertex C. Used by the /signify capture screen: a survey
// taker drops a dot in the triad and we read its position as the three pole weights — the
// same (a,b,c) the cockpit's triads already consume. Points outside the triangle are
// clamped onto it (negative weights zeroed, then renormalised).
export interface Point {
  x: number;
  y: number;
}
export interface Bary {
  a: number;
  b: number;
  c: number;
}

export function pointToBarycentric(p: Point, A: Point, B: Point, C: Point): Bary {
  const v0 = { x: B.x - A.x, y: B.y - A.y };
  const v1 = { x: C.x - A.x, y: C.y - A.y };
  const v2 = { x: p.x - A.x, y: p.y - A.y };
  const d00 = v0.x * v0.x + v0.y * v0.y;
  const d01 = v0.x * v1.x + v0.y * v1.y;
  const d11 = v1.x * v1.x + v1.y * v1.y;
  const d20 = v2.x * v0.x + v2.y * v0.y;
  const d21 = v2.x * v1.x + v2.y * v1.y;
  const denom = d00 * d11 - d01 * d01 || 1;
  let b = (d11 * d20 - d01 * d21) / denom; // weight for B
  let c = (d00 * d21 - d01 * d20) / denom; // weight for C
  let a = 1 - b - c; // weight for A
  // Clamp onto the triangle and renormalise so a + b + c === 1.
  a = Math.max(0, a);
  b = Math.max(0, b);
  c = Math.max(0, c);
  const s = a + b + c || 1;
  return { a: a / s, b: b / s, c: c / s };
}
