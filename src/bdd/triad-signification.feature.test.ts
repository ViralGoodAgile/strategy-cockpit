import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import {
  MIN_STORY_LEN,
  SEGMENTS,
  signifiableTriads,
  signifyReady,
} from '../data/signifiableTriads';
import { TRIAD_SIGNAL, OUTCOMES_SIGNAL } from '../data/sensorData';
import { STRATEGY_TRIADS } from '../data/strategyTriads';
import {
  removeCapturedFrom,
  triadsWithCaptured,
  updateCapturedIn,
} from '../mirrors/capturedTriads';
import { pointToBarycentric } from '../lib/barycentric';
import type { CapturedStory, Triad, TriadStory } from '../domain/sensors';

const reg = signifiableTriads();
const byTitle = (title: string) => reg.find((t) => t.title === title)!;

// Real Triad objects (carry seed stories + interpretations) keyed by title, where they exist.
const realTriads: Record<string, Triad> = {};
TRIAD_SIGNAL.value.triads.forEach((t) => (realTriads[t.title] = t));
realTriads[OUTCOMES_SIGNAL.value.customerTriad.title] = OUTCOMES_SIGNAL.value.customerTriad;

// Interpretations keyed by title — Cynefin, customer and strategy all carry them.
const interpByTitle: Record<string, { by: string; text: string }[]> = {};
TRIAD_SIGNAL.value.triads.forEach((t) => (interpByTitle[t.title] = t.interpretations));
interpByTitle[OUTCOMES_SIGNAL.value.customerTriad.title] =
  OUTCOMES_SIGNAL.value.customerTriad.interpretations;
STRATEGY_TRIADS.forEach((t) => (interpByTitle[t.title] = t.interpretations));

// "Firstname Lastname" — the shape a named individual would take (C4: never allowed).
const PERSON = /^[A-Z][a-z]+ [A-Z][a-z]+$/;

const longStory = 'a recent, real moment that actually happened to us';

const cap = (over: Partial<CapturedStory>): CapturedStory => ({
  id: 'cap-1',
  triadId: 'sensemaking',
  role: 'onboarding teams',
  text: longStory,
  a: 0.7,
  b: 0.2,
  c: 0.1,
  at: '2026-05-24T00:00:00.000Z',
  ...over,
});

const leanIndex = (stories: TriadStory[], period: 'current' | 'prior') => {
  const r = stories.filter((s) => s.period === period);
  const m = r.reduce((o, s) => ({ a: o.a + s.a, b: o.b + s.b, c: o.c + s.c }), { a: 0, b: 0, c: 0 });
  return [m.a, m.b, m.c].indexOf(Math.max(m.a, m.b, m.c));
};

const feature = await loadFeature('src/bdd/triad-signification.feature');

describeFeature(feature, ({ Scenario, ScenarioOutline }) => {
  Scenario('the cockpit can signify every one of its triads', ({ Given, Then, And }) => {
    Given('the signifiable triads', () => {
      expect(reg.length).toBe(8);
    });
    Then('they cover the Cynefin set, the customer voice and the strategy triads', () => {
      expect(reg.filter((t) => t.category === 'cynefin')).toHaveLength(3);
      expect(reg.filter((t) => t.category === 'customer')).toHaveLength(1);
      expect(reg.filter((t) => t.category === 'strategy')).toHaveLength(4);
    });
    And('every triad offers exactly three positive poles', () => {
      for (const t of reg) {
        expect(t.poles).toHaveLength(3);
        for (const p of t.poles) expect(p.trim().length).toBeGreaterThan(0);
      }
    });
    And('every triad id is unique', () => {
      expect(new Set(reg.map((t) => t.id)).size).toBe(reg.length);
    });
  });

  ScenarioOutline(
    'a signification needs both a told story and a free placement',
    ({ Given, When, Then }, variables) => {
      let text = '';
      let placed = false;
      Given('the "<triad>" triad', () => {
        expect(byTitle(variables.triad)).toBeDefined();
      });
      When('only a short fragment is written', () => {
        text = 'ok';
        placed = false;
      });
      Then('signification is blocked', () => {
        expect(text.trim().length).toBeLessThan(MIN_STORY_LEN);
        expect(signifyReady({ na: false, text, placed })).toBe(false);
      });
      When('a real story is written but not placed', () => {
        text = longStory;
        placed = false;
      });
      Then('signification is still blocked', () => {
        expect(signifyReady({ na: false, text, placed })).toBe(false);
      });
      When('the story is placed in the triangle', () => {
        placed = true;
      });
      Then('signification is allowed', () => {
        expect(signifyReady({ na: false, text, placed })).toBe(true);
      });
    },
  );

  ScenarioOutline('every triad allows "not applicable"', ({ Given, When, Then, And }, variables) => {
    let id = '';
    let list: CapturedStory[] = [];
    Given('the "<triad>" triad', () => {
      id = byTitle(variables.triad).id;
    });
    When('the respondent marks it not applicable', () => {
      list = [cap({ triadId: id, na: true, text: '', a: 0, b: 0, c: 0 })];
    });
    Then('they can signify with no story and no placement', () => {
      expect(signifyReady({ na: true, text: '', placed: false })).toBe(true);
    });
    And('the abstention is recorded but never plotted as a dot', () => {
      expect(list).toHaveLength(1); // recorded
      const plottable = list.filter((c) => c.triadId === id && !c.na);
      expect(plottable).toHaveLength(0); // never a dot
    });
  });

  ScenarioOutline(
    "a signified story is plotted as the contributor's own distinct dot",
    ({ Given, When, Then, And }, variables) => {
      let title = '';
      let id = '';
      let list: CapturedStory[] = [];
      Given('the "<triad>" triad', () => {
        title = variables.triad;
        id = byTitle(title).id;
      });
      When('the respondent signifies a story', () => {
        list = [cap({ triadId: id })];
      });
      Then('that triad gains one plottable story', () => {
        const plottable = list.filter((c) => c.triadId === id && !c.na);
        expect(plottable).toHaveLength(1);
      });
      And('it is flagged as captured, so it draws apart from seed stories', () => {
        const real = realTriads[title];
        if (real) {
          const merged = triadsWithCaptured([real], list);
          const story = merged[0].stories.find((s) => s.id === 'cap-1');
          expect(story?.captured).toBe(true);
        } else {
          // strategy triads have no seed Triad; the chart draws every non-N/A capture as a
          // ringed "yours" dot, so being a non-N/A capture is the distinction.
          expect(list[0].na).not.toBe(true);
        }
      });
    },
  );

  Scenario(
    'a captured story merges into a real triad as a current-period dot',
    ({ Given, When, Then, And }) => {
      const triad = realTriads['Sense-making'];
      let before = 0;
      let merged: Triad[] = [];
      Given('the "Sense-making" triad has prior and current seed stories', () => {
        before = triad.stories.filter((s) => s.period === 'current').length;
        expect(triad.stories.some((s) => s.period === 'prior')).toBe(true);
        expect(before).toBeGreaterThan(0);
      });
      When('a story is signified onto it toward the first pole', () => {
        merged = triadsWithCaptured([triad], [cap({ triadId: triad.id, a: 0.8, b: 0.1, c: 0.1 })]);
      });
      Then('the triad shows one more current-period story than before', () => {
        const after = merged[0].stories.filter((s) => s.period === 'current').length;
        expect(after).toBe(before + 1);
      });
      And('the new story is a current-period placement', () => {
        const story = merged[0].stories.find((s) => s.id === 'cap-1');
        expect(story?.period).toBe('current');
      });
    },
  );

  Scenario('placement is free and dispositional, not a Likert score', ({ Given, When, Then, And }) => {
    const A = { x: 120, y: 22 };
    const B = { x: 30, y: 184 };
    const C = { x: 210, y: 184 };
    let w = { a: 0, b: 0, c: 0 };
    Given('a point dropped anywhere inside the triangle', () => {
      // an off-centre interior point
      w = pointToBarycentric({ x: 100, y: 120 }, A, B, C);
    });
    When('it is converted to a placement', () => {
      expect(w).toBeDefined();
    });
    Then('each of the three weights lies between zero and one', () => {
      for (const v of [w.a, w.b, w.c]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    });
    And('the three weights sum to one', () => {
      expect(w.a + w.b + w.c).toBeCloseTo(1);
    });
  });

  Scenario('the contributor identifies a segment, never a named individual', ({ Given, Then }) => {
    Given('the signify segments', () => {
      expect(SEGMENTS.length).toBeGreaterThan(0);
    });
    Then('none of them is a personal name', () => {
      for (const s of SEGMENTS) expect(PERSON.test(s)).toBe(false);
    });
  });

  Scenario(
    'the contributor can revise their own signification without adding a record',
    ({ Given, When, Then, And }) => {
      const triad = realTriads['Sense-making'];
      let list: CapturedStory[] = [cap({ triadId: triad.id, a: 0.8, b: 0.1, c: 0.1 })];
      let merged: Triad[] = [];
      Given('a signified story placed toward the first pole', () => {
        expect(list[0].a).toBeGreaterThan(list[0].c);
      });
      When('the contributor re-places it toward the third pole', () => {
        list = updateCapturedIn(list, 'cap-1', { a: 0.1, b: 0.1, c: 0.8 });
        merged = triadsWithCaptured([triad], list);
      });
      Then('the merged triad plots the new placement', () => {
        const story = merged[0].stories.find((s) => s.id === 'cap-1');
        expect(story?.c).toBeCloseTo(0.8);
      });
      And('the number of captured stories is unchanged', () => {
        expect(list).toHaveLength(1);
      });
    },
  );

  Scenario('withdrawing a signification removes exactly that one', ({ Given, When, Then, And }) => {
    let list: CapturedStory[] = [
      cap({ id: 'cap-1' }),
      cap({ id: 'cap-2', a: 0.1, b: 0.8, c: 0.1 }),
    ];
    Given('two signified stories on a triad', () => {
      expect(list).toHaveLength(2);
    });
    When('the contributor withdraws the first', () => {
      list = removeCapturedFrom(list, 'cap-1');
    });
    Then('one signified story remains', () => {
      expect(list).toHaveLength(1);
    });
    And('it is the second story', () => {
      expect(list[0].id).toBe('cap-2');
    });
  });

  Scenario('a triad reads composite drift, not individual scores', ({ Given, When, Then }) => {
    const stories: TriadStory[] = [
      { id: 'p1', role: 'PM', text: 'earlier', a: 0.8, b: 0.1, c: 0.1, period: 'prior' },
      { id: 'p2', role: 'eng', text: 'earlier', a: 0.7, b: 0.2, c: 0.1, period: 'prior' },
      { id: 'c1', role: 'PM', text: 'now', a: 0.1, b: 0.1, c: 0.8, period: 'current' },
      { id: 'c2', role: 'eng', text: 'now', a: 0.1, b: 0.2, c: 0.7, period: 'current' },
    ];
    let now = -1;
    let before = -1;
    Given('a triad whose current stories lean to a different pole than the prior ones', () => {
      expect(stories.length).toBeGreaterThan(0);
    });
    When('its lean is read for each period', () => {
      now = leanIndex(stories, 'current');
      before = leanIndex(stories, 'prior');
    });
    Then('the current lean differs from the prior lean', () => {
      expect(now).not.toBe(before);
    });
  });

  ScenarioOutline(
    'interpretations are attributed to roles, by people not the cockpit',
    ({ Given, Then, And }, variables) => {
      let interps: { by: string; text: string }[] = [];
      Given("the \"<triad>\" triad's interpretations", () => {
        interps = interpByTitle[variables.triad];
        expect(interps.length).toBeGreaterThan(0);
      });
      Then('each is attributed to a role', () => {
        for (const it of interps) expect(it.by.trim().length).toBeGreaterThan(0);
      });
      And('none is attributed to a named individual', () => {
        for (const it of interps) expect(PERSON.test(it.by)).toBe(false);
      });
    },
  );
});
