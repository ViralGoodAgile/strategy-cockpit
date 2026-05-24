import { describe, it, expect } from 'vitest';
import { loopClosure } from '../mirrors/loopClosure';
import { composeChallenges } from '../challenge/composeChallenge';
import { hygieneRows, hygieneSummary } from '../lib/hygiene';
import { SAMPLE_STRATEGY } from './sample';

describe('scenarios drive the reactive readings (loop / challenge / hygiene)', () => {
  it('baseline leaves loop closure to the evidence (no versions → open/stop)', () => {
    expect(loopClosure([]).state).toBe('stop');
    expect(loopClosure([], 'baseline').state).toBe('stop');
  });

  it('loop closing → the return path flows (closed)', () => {
    const lc = loopClosure([], 'closing');
    expect(lc.state).toBe('flow');
    expect(lc.closed).toBe(true);
  });

  it('loop stalled → the return path stops (open)', () => {
    const lc = loopClosure([], 'stalled');
    expect(lc.state).toBe('stop');
    expect(lc.closed).toBe(false);
  });

  it('crap in → closure cannot be verified (partial)', () => {
    expect(loopClosure([], 'crapIn').state).toBe('partial');
  });

  it('a scenario prepends a headline challenge; baseline adds none', () => {
    const base = composeChallenges(SAMPLE_STRATEGY);
    expect(base.every((c) => !c.id.startsWith('scn-'))).toBe(true);
    const closing = composeChallenges(SAMPLE_STRATEGY, 'closing');
    expect(closing[0].id).toBe('scn-closing');
    expect(closing).toHaveLength(base.length + 1);
  });

  it('crap in degrades hygiene: fewer fresh signals than baseline', () => {
    const baseFresh = hygieneSummary(hygieneRows('baseline')).fresh;
    const crapFresh = hygieneSummary(hygieneRows('crapIn')).fresh;
    expect(crapFresh).toBeLessThan(baseFresh);
  });
});
