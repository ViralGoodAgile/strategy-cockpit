import { test, expect } from '@playwright/test';

// Drives the interactive instruments end-to-end on the real production build: the flow
// movie's transport, the system-model switcher, the radar scope, and the outcomes row.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('the flow movie opens, pauses, and scrubs to a chosen week', async ({ page }) => {
  await page.locator('.inst', { hasText: 'Flow.Constraint' }).first().click();
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
  await expect(page.locator('.toc-week')).toContainText('week');

  // A speed can be selected.
  await page.locator('.toc-speed', { hasText: '2×' }).click();
  await expect(page.locator('.toc-speed-on')).toContainText('2×');

  await page.keyboard.press('Escape');
  await expect(page.locator('.overlay')).toHaveCount(0);
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

  await page.keyboard.press('Escape');
  await expect(page.locator('.overlay')).toHaveCount(0);
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
