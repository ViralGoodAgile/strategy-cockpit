import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('a first visit lands on a live, seeded cockpit', async ({ page }) => {
  await expect(page.getByText('Strategy.Cockpit')).toBeVisible();
  // not the gated "offline" state
  await expect(page.locator('.cockpit-offline')).toHaveCount(0);
  // the instrument cluster + challenge bar are present
  expect(await page.locator('.inst').count()).toBeGreaterThan(5);
  await expect(page.locator('.challenge-bar')).toBeVisible();
  // the build number is shown in the HUD (the short commit the build came from, or "dev")
  await expect(page.locator('.hud-build-no')).toContainText('build');
});

test('the challenges overlay opens and closes', async ({ page }) => {
  await page.locator('.cb-all').click();
  await expect(page.locator('.overlay-title')).toHaveText('Challenges');
  expect(await page.locator('.ch-item').count()).toBeGreaterThan(0);
  await page.locator('.overlay-close').click();
  await expect(page.locator('.overlay')).toHaveCount(0);
});

test('expanding the loop opens its full-screen view', async ({ page }) => {
  await page.locator('.inst-loop .inst-head-click').click();
  await expect(page.locator('.overlay-title')).toHaveText('The loop under inspection');
  await page.keyboard.press('Escape');
  await expect(page.locator('.overlay')).toHaveCount(0);
});

test('the expanded loop carries the EBM goal ladder + experiment ledger', async ({ page }) => {
  await page.locator('.inst-loop .inst-head-click').click();
  await expect(page.locator('.overlay-title')).toHaveText('The loop under inspection');

  // the loop shrinks to a column and shares the room with the goals
  await expect(page.locator('.overlay .loop-detail-canvas .loop-canvas')).toBeVisible();
  const goals = page.locator('.overlay .goals');
  await expect(goals).toBeVisible();

  // a Strategic Goal with a KVA, decomposing into intermediate goals + experiments
  await expect(goals.locator('.goal-strategic .goal-kva')).toBeVisible();
  expect(await goals.locator('.goal-intermediate').count()).toBeGreaterThan(0);
  expect(await goals.locator('.goal-exp').count()).toBeGreaterThan(2);

  // every experiment leads with a hypothesis and a clearly-labelled outcome
  await expect(goals.locator('.goal-exp-hyp').first()).toContainText('We believe');
  await expect(goals.locator('.goal-exp-pill.gx-validated').first()).toBeVisible();
  await expect(goals.locator('.goal-exp-pill.gx-invalidated').first()).toBeVisible();
  await expect(goals.locator('.goal-exp-pill.gx-unsure').first()).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('.overlay')).toHaveCount(0);
});

test('Author mode: start fresh empties the strategy and the cockpit goes offline', async ({ page }) => {
  page.on('dialog', (d) => d.accept()); // accept the "start fresh?" confirm
  await page.locator('.hud-author').click();
  await expect(page.locator('.author')).toBeVisible();
  await page.locator('.author-fresh').click();
  await page.locator('.author-back').click();
  await expect(page.locator('.cockpit-offline')).toBeVisible();
});
