import { describe, it, expect } from 'vitest';
import { levelIndex, levelGap, medianLevel } from './mandate';

describe('mandate ladder', () => {
  it('indexes A..I', () => {
    expect(levelIndex('A')).toBe(0);
    expect(levelIndex('I')).toBe(8);
  });

  it('computes signed gaps', () => {
    expect(levelGap('C', 'F')).toBe(3);
    expect(levelGap('F', 'C')).toBe(-3);
    expect(levelGap('D', 'D')).toBe(0);
  });

  it('finds the median level', () => {
    expect(medianLevel(['C', 'E', 'G'])).toBe('E');
    expect(medianLevel(['F'])).toBe('F');
    expect(medianLevel([])).toBeNull();
  });
});
