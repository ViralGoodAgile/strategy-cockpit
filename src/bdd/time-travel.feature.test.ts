import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import { TRIAD_SIGNAL, RADAR_SIGNAL, WEAK_SIGNAL } from '../data/sensorData';
import { triadAtPeriod, triadHistory, type TriadPeriod } from '../mirrors/triadHistory';
import { radarHistory } from '../mirrors/radarHistory';
import { triadsWithCaptured } from '../mirrors/capturedTriads';
import { hygieneAt, interpretationsAt, mandateGapsAt, weakSignalsAt } from '../mirrors/snapshotHistory';
import { hygieneRows } from '../lib/hygiene';
import type { CapturedStory, Triad, TriadStory } from '../domain/sensors';

const triad = (): Triad => TRIAD_SIGNAL.value.triads[0]; // Sense-making
const PERSON = /^[A-Z][a-z]+ [A-Z][a-z]+$/;

function centroid(stories: { a: number; b: number; c: number }[]) {
  const s = stories.reduce((o, x) => ({ a: o.a + x.a, b: o.b + x.b, c: o.c + x.c }), { a: 0, b: 0, c: 0 });
  const n = stories.length || 1;
  return { a: s.a / n, b: s.b / n, c: s.c / n };
}
const dist = (p: { a: number; b: number; c: number }, q: { a: number; b: number; c: number }) =>
  Math.hypot(p.a - q.a, p.b - q.b, p.c - q.c);
function leanIndex(stories: TriadStory[]) {
  const m = centroid(stories);
  return [m.a, m.b, m.c].indexOf(Math.max(m.a, m.b, m.c));
}
const identity = (t: Triad) => t;

const feature = await loadFeature('src/bdd/time-travel.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('the triad movie runs oldest-first and ends at now', ({ Given, When, Then, And }) => {
    const t = triad();
    let h: TriadPeriod[] = [];
    Given('a Cynefin triad', () => expect(t.stories.length).toBeGreaterThan(0));
    When('its history is generated over 6 periods', () => {
      h = triadHistory(t, 6);
    });
    Then('there are 6 periods, the last labelled "now"', () => {
      expect(h).toHaveLength(6);
      expect(h[5].label).toBe('now');
    });
    And("the last period's stories match the triad's current signification", () => {
      const current = t.stories.filter((s) => s.period === 'current');
      expect(h[5].stories).toHaveLength(current.length);
      expect(dist(centroid(h[5].stories), centroid(current))).toBeLessThan(0.001);
    });
  });

  Scenario('scrubbing a triad to an earlier period shows a different cloud', ({ Given, When, Then }) => {
    const h = triadHistory(triad(), 6);
    let moved = 0;
    Given('a triad movie', () => expect(h.length).toBe(6));
    When('I compare the earliest period to now', () => {
      moved = dist(centroid(h[0].stories), centroid(h[5].stories));
    });
    Then('the centroid has moved between them', () => {
      expect(moved).toBeGreaterThan(0.05);
    });
  });

  Scenario('playing a triad walks the centroid from the prior lean toward the current lean', ({
    Given,
    When,
    Then,
    And,
  }) => {
    const t = triad();
    const priorLean = leanIndex(t.stories.filter((s) => s.period === 'prior'));
    const currentLean = leanIndex(t.stories.filter((s) => s.period === 'current'));
    let h: TriadPeriod[] = [];
    Given('a triad whose current lean differs from its prior', () => {
      expect(priorLean).not.toBe(currentLean);
    });
    When('the movie plays from oldest to now', () => {
      h = triadHistory(t, 6);
    });
    Then('the earliest period leans toward the prior pole', () => {
      expect(leanIndex(h[0].stories)).toBe(priorLean);
    });
    And('the latest period leans toward the current pole', () => {
      expect(leanIndex(h[5].stories)).toBe(currentLean);
    });
  });

  Scenario('a captured story appears only in the "now" period', ({ Given, When, Then, And }) => {
    const t = triad();
    const h = triadHistory(t, 6);
    const cap: CapturedStory = {
      id: 'cap-1',
      triadId: t.id,
      role: 'evaluators',
      text: 'we ran a probe this week',
      a: 0.6,
      b: 0.2,
      c: 0.2,
      at: '2026-05-24T00:00:00.000Z',
    };
    const merge = (base: Triad) => triadsWithCaptured([base], [cap])[0];
    let early: Triad = t;
    Given('a triad movie and a story I signified', () => expect(cap.triadId).toBe(t.id));
    When('I view an earlier period', () => {
      early = triadAtPeriod(t, h, 0, merge);
    });
    Then('my story is not among its dots', () => {
      expect(early.stories.some((s) => s.id === 'cap-1')).toBe(false);
    });
    And('viewing "now" includes my story', () => {
      const now = triadAtPeriod(t, h, h.length - 1, merge);
      expect(now.stories.some((s) => s.id === 'cap-1')).toBe(true);
    });
  });

  Scenario('the drift line connects a period to the one before it', ({ Given, When, Then, And }) => {
    const t = triad();
    const h = triadHistory(t, 6);
    let after: Triad = t;
    Given('a triad movie', () => expect(h.length).toBe(6));
    When('I view any period after the first', () => {
      after = triadAtPeriod(t, h, 2, identity);
    });
    Then('it carries the previous period\'s stories as the prior cloud', () => {
      const prior = after.stories.filter((s) => s.period === 'prior');
      expect(prior.length).toBe(h[1].stories.length);
    });
    And('the first period has no prior cloud', () => {
      const first = triadAtPeriod(t, h, 0, identity);
      expect(first.stories.some((s) => s.period === 'prior')).toBe(false);
    });
  });

  Scenario('the radar movie ends at now equal to the live scope', ({ Given, When, Then, And }) => {
    const current = RADAR_SIGNAL.value;
    let rh = radarHistory(current, 6);
    Given('the radar', () => expect(current.impediments.length).toBeGreaterThan(0));
    When('its history is generated over 6 periods', () => {
      rh = radarHistory(current, 6);
    });
    Then('the last period is labelled "now"', () => {
      expect(rh[5].label).toBe('now');
    });
    And('its impediments are exactly today\'s impediments', () => {
      const nowIds = rh[5].set.impediments.map((i) => i.id).sort();
      const liveIds = current.impediments.map((i) => i.id).sort();
      expect(nowIds).toEqual(liveIds);
    });
  });

  Scenario('an impediment resolved since is present early and gone by now', ({ Given, Then }) => {
    const rh = radarHistory(RADAR_SIGNAL.value, 6);
    Given('a radar movie', () => expect(rh.length).toBe(6));
    Then('an earlier period carries an impediment that "now" does not', () => {
      const earlyIds = new Set(rh[0].set.impediments.map((i) => i.id));
      const nowIds = new Set(rh[5].set.impediments.map((i) => i.id));
      const goneSince = [...earlyIds].filter((id) => !nowIds.has(id));
      expect(goneSince.length).toBeGreaterThan(0);
    });
  });

  Scenario('impediments emerge over time, so earlier periods are smaller', ({ Given, Then }) => {
    const rh = radarHistory(RADAR_SIGNAL.value, 6);
    Given('a radar movie', () => expect(rh.length).toBe(6));
    Then('the earliest period has fewer impediments than now', () => {
      expect(rh[0].set.impediments.length).toBeLessThan(rh[5].set.impediments.length);
    });
  });

  Scenario('every blip keeps a scope level and a valid severity, never a name', ({ Given, Then, And }) => {
    const rh = radarHistory(RADAR_SIGNAL.value, 6);
    const sev = ['high', 'med', 'low'];
    Given('a radar movie', () => expect(rh.length).toBe(6));
    Then('every impediment in every period has a scope level and a high, med or low severity', () => {
      for (const snap of rh) {
        for (const im of snap.set.impediments) {
          expect(im.level).toBeTruthy();
          expect(sev).toContain(im.severity);
        }
      }
    });
    And("no impediment is labelled with a person's name", () => {
      for (const snap of rh) {
        for (const im of snap.set.impediments) expect(PERSON.test(im.label)).toBe(false);
      }
    });
  });

  Scenario('weak signals surface over time', ({ Given, Then }) => {
    const signals = WEAK_SIGNAL.value.signals;
    Given('the weak signals', () => expect(signals.length).toBeGreaterThan(0));
    Then('fewer have surfaced an earlier period back than now', () => {
      const now = weakSignalsAt(signals, 0).length;
      const earlier = weakSignalsAt(signals, 3).length;
      expect(earlier).toBeLessThan(now);
    });
  });

  Scenario('the mandate gap narrows toward now', ({ Given, Then }) => {
    const gaps = [1, 1, 2, 3];
    Given('the mandate gaps now', () => expect(gaps.length).toBeGreaterThan(0));
    Then('they are wider an earlier period back', () => {
      const earlier = mandateGapsAt(gaps, 5, 5);
      const now = mandateGapsAt(gaps, 0, 5);
      expect(earlier.reduce((a, b) => a + b, 0)).toBeGreaterThan(now.reduce((a, b) => a + b, 0));
    });
  });

  Scenario('data hygiene matures toward now', ({ Given, Then }) => {
    const rows = hygieneRows();
    const staleCount = (rs: typeof rows) => rs.filter((r) => r.freshness === 'stale' || r.freshness === 'dead').length;
    Given('the hygiene ledger now', () => expect(rows.length).toBeGreaterThan(0));
    Then('more signals are stale an earlier period back', () => {
      expect(staleCount(hygieneAt(rows, 5, 5))).toBeGreaterThan(staleCount(hygieneAt(rows, 0, 5)));
    });
  });

  Scenario('human interpretations accrue over time', ({ Given, Then }) => {
    const interps = TRIAD_SIGNAL.value.triads[0].interpretations;
    Given("a triad's interpretations", () => expect(interps.length).toBeGreaterThan(1));
    Then('fewer are written an earlier period back than now', () => {
      expect(interpretationsAt(interps, 0, 5).length).toBeLessThan(interpretationsAt(interps, 5, 5).length);
    });
  });
});
