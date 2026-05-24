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

test('Author mode: start fresh empties the strategy and the cockpit goes offline', async ({ page }) => {
  page.on('dialog', (d) => d.accept()); // accept the "start fresh?" confirm
  await page.locator('.hud-author').click();
  await expect(page.locator('.author')).toBeVisible();
  await page.locator('.author-fresh').click();
  await page.locator('.author-back').click();
  await expect(page.locator('.cockpit-offline')).toBeVisible();
});
