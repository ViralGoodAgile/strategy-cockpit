import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import type { CapturedStory, Triad } from '../domain/sensors';
import { removeCapturedFrom, triadsWithCaptured, updateCapturedIn } from '../mirrors/capturedTriads';

// A minimal Sense-making triad: pole[0]=Probe, pole[1]=Analyse, pole[2]=Practice.
function makeTriad(): Triad {
  return {
    id: 't1',
    title: 'Sense-making',
    question: 'When we hit something unfamiliar, our first move was to…',
    poles: [
      { id: 'probe', label: 'Probe & experiment', short: 'Probe' },
      { id: 'analyse', label: 'Analyse & consult', short: 'Analyse' },
      { id: 'practice', label: 'Apply proven practice', short: 'Practice' },
    ],
    stories: [{ id: 's0', role: 'PM', text: 'an earlier moment', a: 0.4, b: 0.3, c: 0.3, period: 'prior' }],
    interpretations: [],
    maps: [],
  };
}

function capture(over: Partial<CapturedStory> = {}): CapturedStory {
  return {
    id: 'cap-1',
    triadId: 't1',
    role: 'onboarding teams',
    text: 'we paused and ran a small probe first',
    a: 0.8,
    b: 0.1,
    c: 0.1,
    at: '2026-05-24T00:00:00.000Z',
    ...over,
  };
}

const feature = await loadFeature('src/bdd/signify.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('a captured story is folded into its triad as a current placement', ({ Given, When, Then, And }) => {
    const triad = makeTriad();
    let captured: CapturedStory[] = [];
    let merged: Triad[] = [];

    Given('a triad with one prior story', () => {
      expect(triad.stories).toHaveLength(1);
      expect(triad.stories[0].period).toBe('prior');
    });
    When('a survey taker captures a story placed toward Probe', () => {
      captured = [capture()];
      merged = triadsWithCaptured([triad], captured);
    });
    Then('the triad shows two stories', () => {
      expect(merged[0].stories).toHaveLength(2);
    });
    And('the captured story is a current-period placement', () => {
      const fresh = merged[0].stories.find((s) => s.id === 'cap-1');
      expect(fresh?.period).toBe('current');
      expect(fresh?.a).toBeCloseTo(0.8);
    });
  });

  Scenario('editing a captured story moves its dot', ({ Given, When, Then, And }) => {
    const triad = makeTriad();
    let captured: CapturedStory[] = [capture()];
    let merged: Triad[] = [];

    Given('a captured story placed toward Probe', () => {
      expect(captured[0].a).toBeGreaterThan(captured[0].c);
    });
    When('the survey taker re-places it toward Practice', () => {
      captured = updateCapturedIn(captured, 'cap-1', { a: 0.1, b: 0.1, c: 0.8 });
      merged = triadsWithCaptured([triad], captured);
    });
    Then('the merged triad plots the new placement', () => {
      const dot = merged[0].stories.find((s) => s.id === 'cap-1');
      expect(dot?.c).toBeCloseTo(0.8);
      expect(dot?.a).toBeCloseTo(0.1);
    });
    And('the story keeps its identity', () => {
      expect(captured).toHaveLength(1);
      expect(captured[0].id).toBe('cap-1');
    });
  });

  Scenario('marking a captured story not-applicable keeps the record but drops its dot', ({
    Given,
    When,
    Then,
    And,
  }) => {
    const triad = makeTriad();
    let captured: CapturedStory[] = [capture()];

    Given('a captured story placed toward Probe', () => {
      expect(captured).toHaveLength(1);
    });
    When('the survey taker marks it not applicable', () => {
      captured = updateCapturedIn(captured, 'cap-1', { na: true, text: '', a: 0, b: 0, c: 0 });
    });
    Then('the record is still kept', () => {
      expect(captured).toHaveLength(1);
      expect(captured[0].na).toBe(true);
    });
    And('the triad plots no dot for it', () => {
      const merged = triadsWithCaptured([triad], captured);
      // only the prior story remains plotted; the N/A capture is recorded but not a dot
      expect(merged[0].stories).toHaveLength(1);
      expect(merged[0].stories.every((s) => s.id !== 'cap-1')).toBe(true);
    });
  });

  Scenario('deleting a captured story removes it from the triad', ({ Given, When, Then, And }) => {
    const triad = makeTriad();
    let captured: CapturedStory[] = [
      capture({ id: 'cap-1' }),
      capture({ id: 'cap-2', text: 'a second story', a: 0.1, b: 0.8, c: 0.1 }),
    ];

    Given('two captured stories on a triad', () => {
      expect(captured).toHaveLength(2);
    });
    When('the survey taker deletes the first', () => {
      captured = removeCapturedFrom(captured, 'cap-1');
    });
    Then('one captured story remains', () => {
      expect(captured).toHaveLength(1);
      expect(captured[0].id).toBe('cap-2');
    });
    And('the triad plots only the remaining dot', () => {
      const merged = triadsWithCaptured([triad], captured);
      const ids = merged[0].stories.map((s) => s.id);
      expect(ids).toContain('cap-2');
      expect(ids).not.toContain('cap-1');
    });
  });
});
