import { test, expect } from '@playwright/test';

// Drives the interactive instruments end-to-end on the real production build: the flow
// movie's transport, the system-model switcher, the radar scope, and the outcomes row.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('the flow movie opens, pauses, and scrubs to a chosen week', async ({ page }) => {
  // The in-cockpit Flow tile's Theory-of-Constraints board must not be truncated
  // (regression guard for the double-height row).
  const flowTile = page.locator('.inst', { hasText: 'Flow.Constraint' }).first();
  const clipped = await flowTile
    .locator('.frw-board .fi-board')
    .evaluate((el) => el.scrollHeight > el.clientHeight + 1);
  expect(clipped).toBe(false);

  await flowTile.click();
  await expect(page.locator('.overlay-title')).toHaveText('Flow.Constraint');

  // Opens auto-playing, so the transport offers "pause".
  const play = page.locator('.toc-play');
  await expect(play).toContainText('pause');
  await play.click();
  await expect(play).toContainText('play'); // now paused

  // Scrubbing jumps to the first frame (and keeps it paused).
  const scrub = page.locator('.toc-scrub');
  await scrub.focus();
  await page.keyboard.press('Home');
  await expect(scrub).toHaveValue('0');
  await expect(page.locator('.toc-asof')).toContainText('week');

  // A speed can be selected.
  await page.locator('.toc-speed', { hasText: '2×' }).click();
  await expect(page.locator('.toc-speed-on')).toContainText('2×');

  await page.keyboard.press('Escape');
  await expect(page.locator('.overlay')).toHaveCount(0);
});

test('time travel does not autoplay when the viewer prefers reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.inst', { hasText: 'Flow.Constraint' }).first().click();
  await expect(page.locator('.overlay-title')).toHaveText('Flow.Constraint');
  // opens paused (offers "play"), and lands on the latest frame ("now"), not frame 0
  await expect(page.locator('.toc-play')).toContainText('play');
});

test('time travel: the triad view plays, pauses and scrubs through periods', async ({ page }) => {
  await page.locator('.inst', { hasText: 'Cynefin triads' }).first().click();
  await expect(page.locator('.overlay-title')).toHaveText('Cynefin triads');
  // opens auto-playing
  const play = page.locator('.overlay .toc-play');
  await expect(play).toContainText('pause');
  await play.click();
  await expect(play).toContainText('play');
  // scrub to the earliest period (not "now"), then to the end ("now")
  const scrub = page.locator('.overlay .toc-scrub');
  await scrub.focus();
  await page.keyboard.press('Home');
  await expect(scrub).toHaveValue('0');
  await expect(page.locator('.overlay .toc-asof')).not.toHaveText('now');
  await page.keyboard.press('End');
  await expect(page.locator('.overlay .toc-asof')).toHaveText('now');
  await page.keyboard.press('Escape');
});

test('time travel: the radar view scrubs from emerging to "now"', async ({ page }) => {
  await page.locator('.inst', { hasText: 'Radar' }).first().click();
  await expect(page.locator('.overlay-title')).toHaveText('Radar — Impediments');
  const scrub = page.locator('.overlay .toc-scrub');
  await scrub.focus();
  await page.keyboard.press('Home'); // earliest period — fewer impediments raised
  await expect(scrub).toHaveValue('0');
  const early = await page.locator('.overlay .radar-grp-row').count();
  await page.keyboard.press('End'); // now — the full live scope
  await expect(page.locator('.overlay .toc-asof')).toHaveText('now');
  const now = await page.locator('.overlay .radar-grp-row').count();
  expect(now).toBeGreaterThan(early);
});

test('time travel: hovering a dot pauses the movie (incl. your own), with no shake', async ({
  page,
}) => {
  // signify a story so there's an "own" (captured) dot to inspect later
  await page.locator('.hud-signify').click();
  await page.locator('.sig-story').fill('We ran a small probe before deciding this week.');
  await page.locator('.sig-svg').click({ position: { x: 150, y: 150 } });
  await page.locator('.sig-submit').click();
  await page.locator('.author-back').click();

  // open the Cynefin triads movie — it autoplays
  await page.locator('.inst', { hasText: 'Cynefin triads' }).first().click();
  await expect(page.locator('.overlay .toc-play')).toContainText('pause');
  await page.locator('.overlay .toc-speed', { hasText: '0.5×' }).click(); // slow it to hover safely

  // hovering a dot pauses the movie, so dots stop moving under the cursor (the shake fix)
  await page.locator('.overlay .tc-dot').first().hover({ force: true });
  await expect(page.locator('.overlay .toc-play')).toContainText('play');

  // now inspect your OWN dot at "now": its caption shows and stays put across >1 frame
  const scrub = page.locator('.overlay .toc-scrub');
  await scrub.focus();
  await page.keyboard.press('End');
  await expect(page.locator('.overlay .toc-asof')).toHaveText('now');
  await page.locator('.overlay .tc-dot-captured').first().hover({ force: true });
  const role = page.locator('.overlay .tc-story .tc-role').first();
  await expect(role).toBeVisible();
  await page.waitForTimeout(1300); // longer than a frame — would flicker if still advancing
  await expect(role).toBeVisible();
  await expect(page.locator('.overlay .toc-play')).toContainText('play');
});

test('global time travel: a HUD control travels the whole dashboard; widgets override', async ({
  page,
}) => {
  // the dashboard opens "as of now"
  await expect(page.locator('.hud-time-chip')).toContainText('now');

  // open the control, choose a granularity, then scrub the global as-of back
  await page.locator('.hud-time-chip').click();
  await page.locator('.gt-unit').selectOption('months');
  const scrub = page.locator('.gt-scrub');
  await scrub.focus();
  await page.keyboard.press('Home');
  await expect(page.locator('.hud-time-chip')).toContainText('mo ago');
  await page.locator('.hud-time-backdrop').click(); // close the popover

  // travel-capable tiles reflect the global as-of, in the chosen granularity
  const radarTile = page.locator('.inst', { hasText: 'Radar' }).first();
  await expect(radarTile.locator('.inst-sub')).toContainText('mo ago');
  const triadTile = page.locator('.inst', { hasText: 'Cynefin triads' }).first();
  await expect(triadTile.locator('.inst-sub')).toContainText('mo ago');

  // per-widget override: opening a widget gives it its own transport, independent of the
  // global as-of, with the granularity carried into its labels
  await triadTile.click();
  await expect(page.locator('.overlay-title')).toHaveText('Cynefin triads');
  const oscrub = page.locator('.overlay .toc-scrub');
  await oscrub.focus();
  await page.keyboard.press('Home');
  await expect(page.locator('.overlay .toc-asof')).toContainText('mo ago');
  await page.keyboard.press('End');
  await expect(page.locator('.overlay .toc-asof')).toHaveText('now'); // independent of global
});

test('time travel: product-outcomes numbers travel on the tile and in the overlay', async ({
  page,
}) => {
  const tile = page.locator('.inst', { hasText: 'Product outcomes' }).first();
  const acq = tile.locator('.po-metric', { hasText: 'Acquisition' }).locator('.po-m-val');
  // at "now" the number is current
  await expect(acq).toHaveText('142');

  // travel the whole dashboard back via the global control → the number reads "as of" then
  await page.locator('.hud-time-chip').click();
  const scrub = page.locator('.gt-scrub');
  await scrub.focus();
  await page.keyboard.press('Home');
  await page.locator('.hud-time-backdrop').click();
  await expect(acq).toHaveText('96');
  await expect(tile.locator('.inst-sub')).toContainText('ago');

  // the overlay carries its own transport (overrides the global as-of): scrub it to "now"
  await tile.click();
  await expect(page.locator('.overlay-title')).toHaveText('Product Outcomes');
  await expect(page.locator('.overlay .toc-play')).toContainText('pause'); // its own movie autoplays
  const oscrub = page.locator('.overlay .toc-scrub');
  await oscrub.focus();
  await page.keyboard.press('End');
  await expect(page.locator('.overlay .toc-asof')).toHaveText('now');
  await expect(page.locator('.overlay .outcomes-grid .numeral-value').first()).toContainText('142');
});

test('time travel: strategy triads travel on the tile and in the overlay', async ({ page }) => {
  const tile = page.locator('.inst', { hasText: 'Strategy triads' }).first();
  await expect(tile.locator('.inst-sub')).toContainText('now');

  // travel the whole dashboard back via the global control
  await page.locator('.hud-time-chip').click();
  const scrub = page.locator('.gt-scrub');
  await scrub.focus();
  await page.keyboard.press('Home');
  await page.locator('.hud-time-backdrop').click();
  await expect(tile.locator('.inst-sub')).toContainText('ago');

  // the overlay carries its own transport (overrides the global as-of)
  await tile.click();
  await expect(page.locator('.overlay-title')).toHaveText('Strategy triads');
  await expect(page.locator('.overlay .toc-play')).toContainText('pause'); // its own movie autoplays
  const oscrub = page.locator('.overlay .toc-scrub');
  await oscrub.focus();
  await page.keyboard.press('End');
  await expect(page.locator('.overlay .toc-asof')).toHaveText('now');
});

test('time travel: a widget overlay can change the granularity (weeks…years)', async ({ page }) => {
  await page.locator('.inst', { hasText: 'Cynefin triads' }).first().click();
  await expect(page.locator('.overlay-title')).toHaveText('Cynefin triads');
  const scrub = page.locator('.overlay .toc-scrub');
  await scrub.focus();
  await page.keyboard.press('Home'); // an earlier period, not "now"
  await expect(page.locator('.overlay .toc-asof')).toContainText('wks ago'); // default: weeks
  // the granularity chooser lives inside the widget too
  await page.locator('.overlay .toc-unit').selectOption('quarters');
  await expect(page.locator('.overlay .toc-asof')).toContainText('qtrs ago');
});

test('time travel: quant + reliability numbers travel (tiles + overlays)', async ({ page }) => {
  const quant = page.locator('.inst', { hasText: 'Quant' }).first();
  const deploy = quant.locator('.numeral', { hasText: 'Deploy frequency' }).locator('.numeral-value');
  await expect(deploy).toHaveText('2.3 / day');

  // travel the whole dashboard back → the number reads "as of" then
  await page.locator('.hud-time-chip').click();
  const scrub = page.locator('.gt-scrub');
  await scrub.focus();
  await page.keyboard.press('Home');
  await page.locator('.hud-time-backdrop').click();
  await expect(deploy).toHaveText('1.5 / day');
  await expect(quant.locator('.inst-sub')).toContainText('ago');

  // quant overlay carries its own transport (DORA + DataDog as one movie): scrub to now
  await quant.click();
  await expect(page.locator('.overlay-title')).toHaveText('DORA & DataDog');
  await expect(page.locator('.overlay .toc-play')).toContainText('pause');
  const oscrub = page.locator('.overlay .toc-scrub');
  await oscrub.focus();
  await page.keyboard.press('End');
  await expect(page.locator('.overlay .toc-asof')).toHaveText('now');
  await page.keyboard.press('Escape');

  // reliability overlay also time-travels
  await page.locator('.inst', { hasText: 'Reliability' }).first().click();
  await expect(page.locator('.overlay-title')).toHaveText('Reliability');
  await expect(page.locator('.overlay .toc-play')).toContainText('pause');
});

test('time travel: the snapshot tiles (mandate, hygiene, weak) travel with the dashboard', async ({
  page,
}) => {
  const weak = page.locator('.inst', { hasText: 'Weak signals' }).first();
  await expect(weak.locator('.ws-read-row').first()).toBeVisible(); // signals present at "now"

  // travel the whole dashboard to the earliest period
  await page.locator('.hud-time-chip').click();
  const scrub = page.locator('.gt-scrub');
  await scrub.focus();
  await page.keyboard.press('Home');
  await page.locator('.hud-time-backdrop').click();

  // weak signals hadn't surfaced yet; every snapshot tile's sub reflects the as-of
  await expect(weak.locator('.ws-empty')).toBeVisible();
  await expect(weak.locator('.inst-sub')).toContainText('ago');
  await expect(page.locator('.inst', { hasText: 'Mandate Levels' }).first().locator('.inst-sub')).toContainText('ago');
  await expect(page.locator('.inst', { hasText: 'Data hygiene' }).first().locator('.inst-sub')).toContainText('ago');

  // and the weak-signals overlay travels too (its own transport)
  await weak.click();
  await expect(page.locator('.overlay-title')).toHaveText('Weak Signals');
  await expect(page.locator('.overlay .toc-play')).toContainText('pause');
});

test('the system model expands and switches among the seed CLDs', async ({ page }) => {
  await page.locator('.inst', { hasText: 'System model' }).first().click();
  await expect(page.locator('.overlay-title')).toHaveText('System Model');
  await expect(page.locator('.overlay .cld-svg')).toBeVisible();

  const tabs = page.locator('.overlay .sm-tab');
  expect(await tabs.count()).toBeGreaterThan(1);
  // Switch to a different model; the diagram stays rendered and the tab activates.
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveClass(/sm-tab-on/);
  await expect(page.locator('.overlay .cld-svg')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('.overlay')).toHaveCount(0);
});

test('the radar expands to a legible scope', async ({ page }) => {
  await page.locator('.inst', { hasText: 'Radar' }).first().click();
  await expect(page.locator('.overlay-title')).toHaveText('Radar — Impediments');
  await expect(page.locator('.overlay .radar-svg')).toBeVisible();
  // Blips are plotted on the scope.
  expect(await page.locator('.overlay .radar-blip').count()).toBeGreaterThan(0);
  // Rings must read as bold concentric circles — regression guard against the faint hairline.
  const ringW = await page
    .locator('.overlay .radar-ring')
    .first()
    .evaluate((el) => parseFloat(getComputedStyle(el).strokeWidth));
  expect(ringW).toBeGreaterThanOrEqual(1.5);

  // each blip is hoverable and names its impediment
  await page.locator('.overlay .radar-blip-hit').first().hover();
  await expect(page.locator('.overlay .radar-tip')).toHaveCount(1);
  await expect(page.locator('.overlay .radar-tip')).not.toBeEmpty();

  await page.keyboard.press('Escape');
  await expect(page.locator('.overlay')).toHaveCount(0);
});

test('strategy triads show per-triad interpretations from different groups', async ({ page }) => {
  await page.locator('.inst', { hasText: 'Strategy triads' }).first().click();
  await expect(page.locator('.overlay-title')).toHaveText('Strategy triads');
  // four triads, each with an interpretations block (≥2 group readings apiece)
  expect(await page.locator('.overlay .triad-interp').count()).toBeGreaterThanOrEqual(4);
  expect(await page.locator('.overlay .triad-interp-row').count()).toBeGreaterThanOrEqual(8);
  await expect(page.locator('.overlay .triad-interp-by').first()).not.toBeEmpty();

  // the centroid dot is hoverable — its quality strengths read in the caption beneath
  // (a reserved line, so hovering never reflows the column or floats text over the dots)
  await page.locator('.overlay .tc-dot-hit').first().hover();
  await expect(page.locator('.overlay .tc-story').first()).toContainText('authored');

  await page.keyboard.press('Escape');
  await expect(page.locator('.overlay')).toHaveCount(0);
});

test('product outcomes show AARRR/HEART lenses, a customer triad and unserved customer jobs', async ({ page }) => {
  // The full-width product-outcomes row is skimmable in place.
  const tile = page.locator('.inst', { hasText: 'Product outcomes' }).first();

  // two metric lenses, five measures each
  const lenses = tile.locator('.po-lens');
  await expect(lenses).toHaveCount(2);
  await expect(lenses.nth(0)).toContainText('AARRR');
  await expect(lenses.nth(1)).toContainText('HEART');
  expect(await lenses.nth(0).locator('.po-metric').count()).toBe(5);
  expect(await lenses.nth(1).locator('.po-metric').count()).toBe(5);
  // each metric shows a prominent multi-point SIGNAL arrow + a small last-point arrow
  expect(await lenses.nth(0).locator('.po-metric .mtrend-run').count()).toBe(5);
  await expect(lenses.nth(0).locator('.po-metric').first().locator('.mtrend-last')).toBeVisible();
  // both arrows carry a hoverable hint: signal (for systems thinkers) vs last-point (noise)
  const firstMetric = lenses.nth(0).locator('.po-metric').first();
  await expect(firstMetric.locator('.mtrend-run')).toHaveAttribute('title', /SIGNAL/);
  // the signal hint names the actual readings (not just "6 data points"): Acquisition runs 96…142
  await expect(firstMetric.locator('.mtrend-run')).toHaveAttribute('title', /96.*142/);
  await expect(firstMetric.locator('.mtrend-last')).toHaveAttribute('title', /single data point/);
  // the headline systems-thinking case: Engagement's signal disagrees with its last point —
  // the prominent arrow points down (the run is sliding) while the last-point arrow points up.
  const eng = lenses.nth(1).locator('.po-metric', { hasText: 'Engagement' });
  await expect(eng.locator('.mtrend')).toHaveClass(/mtrend-diverge/);
  await expect(eng.locator('.mtrend-run')).toHaveClass(/trend-down/);
  await expect(eng.locator('.mtrend-last')).toHaveClass(/trend-up/);

  // customer sense-making triad renders and reports its lean
  await expect(tile.locator('.po-triad-chart .tc-svg')).toBeVisible();
  await expect(tile.locator('.po-triad-finding')).toContainText('Friction-free');

  // unserved CUSTOMER jobs, skimmable in place (phrased as customer JTBD)
  await expect(tile.locator('.po-jobs .po-lens-head')).toContainText('Unserved customer jobs');
  expect(await tile.locator('.po-job').count()).toBe(3);
  await expect(tile.locator('.po-job-text').first()).toContainText('When ');

  // Expanding reveals the full set: both lenses, all jobs with evidence, full triad.
  await tile.click();
  await expect(page.locator('.overlay-title')).toHaveText('Product Outcomes');
  await expect(page.locator('.overlay')).toContainText('AARRR');
  await expect(page.locator('.overlay')).toContainText('HEART');
  expect(await page.locator('.outcomes-job').count()).toBe(4);
  await expect(page.locator('.outcomes-job-text').first()).toContainText('When ');
  await expect(page.locator('.outcomes-job-evidence').first()).not.toBeEmpty();
  await expect(page.locator('.po-detail-triad .tc-svg')).toBeVisible();
  // Triangle outline must read as a bold stroke — regression guard against the faint hairline.
  const frameW = await page
    .locator('.po-detail-triad .tc-frame')
    .first()
    .evaluate((el) => parseFloat(getComputedStyle(el).strokeWidth));
  expect(frameW).toBeGreaterThanOrEqual(1.5);
  // story dots are hoverable — hovering one names its author-role in the caption beneath
  await page.locator('.po-detail-triad .tc-dot-hit').first().hover();
  await expect(page.locator('.po-detail-triad .tc-story .tc-role')).toBeVisible();
  await expect(page.locator('.po-detail-triad .tc-story')).not.toContainText('hover a dot');

  await page.keyboard.press('Escape');
  await expect(page.locator('.overlay')).toHaveCount(0);
});

test('the whole instrument cluster fits a 1440×860 laptop with nothing truncated', async ({
  page,
}) => {
  // Density regression guard. The no-scroll cockpit must show every instrument's content
  // on a typical 1440×900 MacBook (~860px usable height) — the height the truncation pass
  // was tuned for. Two kinds of clipping are checked, because some dense tiles stretch a
  // grid to fill (align-content: space-between), so body scrollHeight can't see their squish.
  await page.setViewportSize({ width: 1440, height: 860 });
  await page.reload();
  await expect(page.locator('.inst', { hasText: 'Product outcomes' }).first()).toBeVisible();

  const report = await page.evaluate(() => {
    const TOL = 4; // tolerate sub-pixel + cross-platform font-metric variance

    // (a) tiles whose content overflows their body box (text + flex-column tiles)
    const bodyClips: { area: string; clip: number }[] = [];
    document.querySelectorAll('.inst').forEach((inst) => {
      const body = inst.querySelector('.inst-body');
      if (!body) return;
      const clip = body.scrollHeight - body.clientHeight;
      if (clip > TOL) {
        const area = getComputedStyle(inst).gridArea.split('/')[0].trim();
        bodyClips.push({ area, clip });
      }
    });

    // (b) stretch grids hide overflow by spreading rows — detect by rows that overlap.
    //     For each group, sort by top and flag any pair on different rows that collide.
    const overlaps: { group: string; gap: number }[] = [];
    const checkRows = (group: string, sel: string) => {
      const rects = [...document.querySelectorAll(sel)]
        .map((e) => e.getBoundingClientRect())
        .sort((a, b) => a.top - b.top);
      for (let i = 1; i < rects.length; i++) {
        if (rects[i].top - rects[i - 1].top > 2) {
          const gap = rects[i].top - rects[i - 1].bottom;
          if (gap < -TOL) overlaps.push({ group, gap: Math.round(gap) });
        }
      }
    };
    checkRows('quant', '.inst .quant-grid .numeral');
    checkRows('aarrr', '.po-lens:nth-child(1) .po-metric');
    checkRows('heart', '.po-lens:nth-child(2) .po-metric');
    checkRows('jobs', '.po-job');

    const pageScroll =
      document.documentElement.scrollHeight - document.documentElement.clientHeight;

    return { bodyClips, overlaps, pageScroll };
  });

  expect(report.bodyClips).toEqual([]);
  expect(report.overlaps).toEqual([]);
  expect(report.pageScroll).toBeLessThanOrEqual(1);
});

test('scenario toggles make the loop and challenge react', async ({ page }) => {
  const ret = page.locator('.inst-loop .loop-return');

  // stalled → return path open / stop, challenge reframed
  await page.locator('.scn-pill', { hasText: 'Loop stalled' }).click();
  await expect(ret).toContainText('open');
  await expect(ret).toHaveClass(/loop-return-stop/);
  await expect(page.locator('.challenge-bar .cb-q')).toContainText('Reality has moved');

  // closing → return path closed / flow
  await page.locator('.scn-pill', { hasText: 'Loop closing' }).click();
  await expect(ret).toContainText('closed');
  await expect(ret).toHaveClass(/loop-return-flow/);
  await expect(page.locator('.challenge-bar .cb-q')).toContainText('Intent followed');

  // crap in → hygiene degrades; challenge is about trust
  await page.locator('.scn-pill', { hasText: 'Crap in' }).click();
  await expect(page.locator('.challenge-bar .cb-q')).toContainText('trust');

  // back to baseline
  await page.locator('.scn-pill', { hasText: 'Baseline' }).click();
});

test('the reliability instrument expands to the production subset, shown as trend', async ({ page }) => {
  const tile = page.locator('.inst', { hasText: 'Reliability' }).first();
  await expect(tile).toContainText('production subset');

  await tile.click();
  await expect(page.locator('.overlay-title')).toHaveText('Reliability');
  // the production measures render as numerals…
  await expect(page.locator('.overlay')).toContainText('Uptime');
  await expect(page.locator('.overlay')).toContainText('MTTR');
  expect(await page.locator('.overlay .numeral').count()).toBeGreaterThan(2);
  // …each with a prominent multi-point signal arrow (trend, not a pass/fail target)
  expect(await page.locator('.overlay .mtrend-run').count()).toBeGreaterThan(2);

  await page.keyboard.press('Escape');
  await expect(page.locator('.overlay')).toHaveCount(0);
});

test('signify: a survey taker captures a story into a triad', async ({ page }) => {
  await page.locator('.hud-signify').click();
  await expect(page.locator('.author-title')).toHaveText('Signify a story');

  // median guides (as in the result charts) are on by default and can be toggled off
  await expect(page.locator('.sig-guides')).toBeChecked();
  expect(await page.locator('.sig-svg .tc-guide').count()).toBe(3);
  await page.locator('.sig-guides').uncheck();
  expect(await page.locator('.sig-svg .tc-guide').count()).toBe(0);
  await page.locator('.sig-guides').check();

  // story-first: submit is disabled until there's a story AND a placement
  await expect(page.locator('.sig-submit')).toBeDisabled();
  await page.locator('.sig-story').fill('Returning after a week away, I could not tell what had changed.');
  // place the dot by tapping inside the triangle
  await page.locator('.sig-svg').click({ position: { x: 160, y: 160 } });
  await expect(page.locator('.sig-dot')).toBeVisible();
  await expect(page.locator('.sig-submit')).toBeEnabled();

  await page.locator('.sig-submit').click();
  await expect(page.locator('.sig-saved')).toBeVisible();
  await expect(page.locator('.author-fresh')).toContainText('1 captured');

  await page.locator('.author-back').click();
  await expect(page.locator('.dash-grid')).toBeVisible();

  // persisted + visible: opening the Cynefin triads shows the captured story as a distinct
  // ringed "yours" dot, with a legend — not lost, not indistinguishable from seed stories.
  // The triads time-travel, and a contributor's dot lives in the "now" period — scrub there.
  await page.locator('.inst', { hasText: 'Cynefin triads' }).first().click();
  await expect(page.locator('.overlay-title')).toHaveText('Cynefin triads');
  const scrub = page.locator('.overlay .toc-scrub');
  await scrub.focus();
  await page.keyboard.press('End');
  await expect(page.locator('.overlay .toc-asof')).toHaveText('now');
  await expect(page.locator('.overlay .tc-dot-captured')).toHaveCount(1);
  await expect(page.locator('.overlay .tc-dot-ring')).toHaveCount(1);
  await expect(page.locator('.overlay .triad-legend')).toContainText('ringed in champagne');
});

test('signify: every triad allows "not applicable" without a story or placement', async ({ page }) => {
  await page.locator('.hud-signify').click();
  // each triad tab exposes the N/A checkbox; submit is gated until N/A or a placement
  const tabs = page.locator('.sig-tab');
  const n = await tabs.count();
  expect(n).toBeGreaterThanOrEqual(3);
  for (let i = 0; i < n; i++) {
    await tabs.nth(i).click();
    await expect(page.locator('.sig-submit')).toBeDisabled();
    await expect(page.locator('.sig-na')).toBeVisible();
  }
  // mark the current triad not applicable → submit enabled with no story/placement
  await page.locator('.sig-na').check();
  await expect(page.locator('.sig-svg')).toHaveClass(/sig-svg-disabled/);
  await expect(page.locator('.sig-submit')).toBeEnabled();
  await page.locator('.sig-submit').click();
  await expect(page.locator('.author-fresh')).toContainText('1 captured');
});

test('signify: the "whose situation" segment list is configurable', async ({ page }) => {
  await page.locator('.hud-signify').click();
  const select = page.locator('.sig-role');
  // a custom segment isn't offered yet
  await expect(select.locator('option', { hasText: 'beta cohort' })).toHaveCount(0);

  // open the editor and add one — it appears in the picker
  await page.locator('.sig-seg-toggle').click();
  await page.locator('.sig-seg-input').fill('beta cohort');
  await page.locator('.sig-seg-addbtn').click();
  await expect(select.locator('option', { hasText: 'beta cohort' })).toHaveCount(1);

  // remove a default segment — it leaves the picker
  await page.locator('.sig-seg-chip', { hasText: 'evaluators' }).locator('.sig-seg-del').click();
  await expect(select.locator('option', { hasText: 'evaluators' })).toHaveCount(0);
});

test('signify: a captured story can be edited, and deleted only after confirming', async ({
  page,
}) => {
  await page.locator('.hud-signify').click();
  await expect(page.locator('.author-title')).toHaveText('Signify a story');

  // capture one story so the manager has something to act on
  await page.locator('.sig-story').fill('We ran a quick spike before committing the squad.');
  await page.locator('.sig-svg').click({ position: { x: 120, y: 150 } });
  await page.locator('.sig-submit').click();

  const row = page.locator('.sig-cap-row');
  await expect(row).toHaveCount(1);
  await expect(row.locator('.sig-cap-text')).toContainText('quick spike');

  // EDIT — loads back into the form and saves in place (no new row)
  await row.locator('.sig-cap-edit').click();
  await expect(page.locator('.sig-editing')).toBeVisible();
  await expect(page.locator('.sig-submit')).toHaveText('Save changes');
  await page.locator('.sig-story').fill('EDITED — we ran a spike, then reviewed before scaling.');
  await page.locator('.sig-submit').click();
  await expect(page.locator('.sig-cap-row')).toHaveCount(1);
  await expect(page.locator('.sig-cap-text')).toContainText('EDITED');
  await expect(page.locator('.author-fresh')).toContainText('1 captured');

  // DELETE needs confirmation — "No" cancels, the story survives
  await page.locator('.sig-cap-del').click();
  await expect(page.locator('.sig-cap-confirm')).toBeVisible();
  await page.locator('.sig-cap-no').click();
  await expect(page.locator('.sig-cap-row')).toHaveCount(1);

  // …"Yes" removes it
  await page.locator('.sig-cap-del').click();
  await page.locator('.sig-cap-yes').click();
  await expect(page.locator('.sig-cap-row')).toHaveCount(0);
  await expect(page.locator('.sig-captured-empty')).toBeVisible();
  await expect(page.locator('.author-fresh')).toContainText('0 captured');
});

test('signify: the customer and strategy triads accept stories, shown as distinct dots', async ({
  page,
}) => {
  await page.locator('.hud-signify').click();
  // the picker is grouped — Cynefin, Customer and Strategy — and offers all eight triads
  await expect(page.locator('.sig-tab-cat')).toHaveCount(3);
  expect(await page.locator('.sig-tab').count()).toBe(8);

  // signify the customer triad
  await page.locator('.sig-tab', { hasText: 'Customer sense-making' }).click();
  await page.locator('.sig-story').fill('The first artefact made the value obvious within minutes.');
  await page.locator('.sig-svg').click({ position: { x: 120, y: 150 } });
  await page.locator('.sig-submit').click();
  await expect(page.locator('.author-fresh')).toContainText('1 captured');

  // signify a strategy triad (Direction) — its vertices are quality names
  await page.locator('.sig-tab', { hasText: 'Direction' }).click();
  await expect(page.locator('.sig-question')).toContainText('this strategy showed up');
  await page.locator('.sig-story').fill('Leadership held us to one outcome and cut two side quests.');
  await page.locator('.sig-svg').click({ position: { x: 130, y: 150 } });
  await page.locator('.sig-submit').click();
  await expect(page.locator('.author-fresh')).toContainText('2 captured');

  await page.locator('.author-back').click();

  // the customer voice (Product Outcomes overlay) shows the ringed "yours" dot — it now
  // time-travels, and your dot lives at "now", so scrub there
  await page.locator('.inst', { hasText: 'Product outcomes' }).first().click();
  await expect(page.locator('.overlay-title')).toHaveText('Product Outcomes');
  const poScrub = page.locator('.overlay .toc-scrub');
  await poScrub.focus();
  await page.keyboard.press('End');
  await expect(page.locator('.overlay .toc-asof')).toHaveText('now');
  await expect(page.locator('.po-detail-triad .tc-dot-captured')).toHaveCount(1);
  await page.keyboard.press('Escape');

  // the strategy triads overlay shows the ringed perceived dot + the perceived-vs-authored
  // legend — it now time-travels too, and your dot lives at "now", so scrub there
  await page.locator('.inst', { hasText: 'Strategy triads' }).first().click();
  await expect(page.locator('.overlay-title')).toHaveText('Strategy triads');
  const stScrub = page.locator('.overlay .toc-scrub');
  await stScrub.focus();
  await page.keyboard.press('End');
  await expect(page.locator('.overlay .toc-asof')).toHaveText('now');
  await expect(page.locator('.overlay .tc-dot-captured')).toHaveCount(1);
  await expect(page.locator('.overlay .triad-legend')).toContainText('perceived');
});

test('the colour-scheme switcher re-themes the cockpit (incl. colour-blind-safe)', async ({ page }) => {
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'obsidian');
  const tlRed = () =>
    page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--tl-red').trim());
  const obsidianRed = await tlRed();

  // colour-safe remaps the red/green status palette
  await page.locator('.thm-colorsafe').click();
  await expect(html).toHaveAttribute('data-theme', 'colorsafe');
  expect(await tlRed()).not.toBe(obsidianRed);

  // slate switches the field/accent
  await page.locator('.thm-slate').click();
  await expect(html).toHaveAttribute('data-theme', 'slate');

  // persists across reload
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'slate');
  await page.locator('.thm-obsidian').click();
});
