import { describe, it, expect } from 'vitest';
import { loopClosure } from './loopClosure';
import type { StrategyVersion } from '../domain/types';
import { emptyStrategy } from '../domain/qualities';

function ver(version: string, intent: string): StrategyVersion {
  const strategy = emptyStrategy();
  strategy.intent.text = intent;
  return { version, savedAt: new Date().toISOString(), strategy };
}

describe('loopClosure (evidence-driven return path)', () => {
  it('is open with no versions', () => {
    const lc = loopClosure([]);
    expect(lc.closed).toBe(false);
    expect(lc.state).toBe('stop');
  });

  it('is open when intent is unchanged across versions', () => {
    const lc = loopClosure([ver('0.1', 'same intent'), ver('0.2', 'same intent')]);
    expect(lc.closed).toBe(false);
  });

  it('closes when intent is revised after reality moved', () => {
    const lc = loopClosure([ver('0.1', 'before'), ver('0.2', 'after — revised in response')]);
    expect(lc.closed).toBe(true);
    expect(lc.state).toBe('flow');
  });
});
