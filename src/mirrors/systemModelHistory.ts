import type { CldLink, LinkKind, SystemModel } from '../domain/sensors';

// A system model is a living seed, not a fixed finding: over time links are drawn, re-routed
// and dropped, beliefs about a correlation's sign reverse, and soft hypotheses harden toward
// causation. These pure helpers synthesise that history so the CLD can travel like the rest of
// the dashboard. "now" (offset 0) is always the live model, untouched.

// Going back in time, a link is LESS sure than it is now (causation → correlation → hypothesis).
const LESS_SURE: Record<LinkKind, LinkKind> = {
  causation: 'correlation',
  correlation: 'hypothesis',
  hypothesis: 'hypothesis',
};

// The model as it stood `offset` periods ago. Coherent, deterministic drift — never noise:
//  (a) fewer links earlier — the newest links (array tail) hadn't been drawn yet;
//  (b) softer earlier — every link's confidence is downgraded a rank or two;
//  (c) re-routed — in the older half, the first link ran the other way;
//  (d) a belief since reversed — in the older half, the last surviving link read the opposite sign.
export function systemModelAt(model: SystemModel, offset: number, last: number): SystemModel {
  if (offset <= 0 || model.links.length === 0) return model;
  const frac = last > 0 ? offset / last : 0;
  const olderHalf = offset >= Math.ceil(last / 2);

  // (a) drop up to two of the newest links, but never leave fewer than two.
  const drop = Math.min(Math.max(0, model.links.length - 2), Math.round(frac * 2));
  const kept = model.links.slice(0, model.links.length - drop);

  // (b) how many ranks to soften every surviving link's confidence.
  const steps = Math.round(frac * 1.5);
  const soften = (k: LinkKind): LinkKind => {
    let r = k;
    for (let i = 0; i < steps; i++) r = LESS_SURE[r];
    return r;
  };

  const links: CldLink[] = kept.map((l, i) => {
    let { from, to } = l;
    let sign = l.sign;
    const kind = soften(l.kind);
    if (olderHalf && i === 0) [from, to] = [to, from]; // (c) re-routed
    if (olderHalf && i === kept.length - 1) sign = sign === '+' ? '-' : '+'; // (d) sign since reversed
    return { from, to, sign, kind };
  });

  return { ...model, links };
}
