import { expect, test } from '@playwright/test';
import { getHUD, launchGame, pressKey } from '../helpers';

test.describe('Epic 049: Audio System', () => {
  test('Game loads and plays without audio crashes', async ({ page }) => {
    test.setTimeout(30_000);

    const pageErrors: string[] = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await launchGame(page);

    // Fire a shot
    await pressKey(page, 'Space');

    // Wait for turn to advance (projectile + explosion + audio)
    await page.waitForTimeout(5_000);

    // Handle shop phase if it appeared
    const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
    if (await shopBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await shopBtn.click();
      await page.waitForTimeout(500);
    }

    // Game should still be running (HUD, shop, or victory screen)
    const hud = getHUD(page);
    const hudVisible = await hud.isVisible().catch(() => false);
    const victoryVisible = await page.locator('[data-testid="victory-screen"]').isVisible().catch(() => false);
    const canvasVisible = await page.locator('[data-testid="game-canvas"]').isVisible().catch(() => false);
    expect(hudVisible || victoryVisible || canvasVisible, 'Game should still be running or show victory').toBe(true);

    if (pageErrors.length > 0) {
      test.info().annotations.push({
        type: 'note',
        description: `Uncaught page errors: ${pageErrors.join(' | ')}`,
      });
    }

    expect(pageErrors, 'no uncaught errors after firing with audio').toHaveLength(0);
  });

  test('Multiple rounds play without audio errors', async ({ page }) => {
    test.setTimeout(60_000);

    const pageErrors: string[] = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await launchGame(page);

    // Fire 3 shots, waiting for turn advance between each
    for (let round = 0; round < 3; round++) {
      // Handle shop if it appeared
      const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
      if (await shopBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await shopBtn.click();
        await page.waitForTimeout(500);
      }
      // Check if game ended before firing
      const hudVisible = await getHUD(page).isVisible().catch(() => false);
      if (!hudVisible) break;
      await pressKey(page, 'Space');
      // Wait for projectile resolution and turn advance
      await page.waitForTimeout(5_000);
    }

    // Handle shop phase if it appeared
    const shopBtn2 = page.locator('[data-testid="shop-ready-btn"]');
    if (await shopBtn2.isVisible({ timeout: 500 }).catch(() => false)) {
      await shopBtn2.click();
      await page.waitForTimeout(500);
    }

    // Game should still be running or have ended normally
    const hud = getHUD(page);
    const hudVisible = await hud.isVisible().catch(() => false);
    const victoryVisible = await page.locator('[data-testid="victory-screen"]').isVisible().catch(() => false);
    const canvasVisible = await page.locator('[data-testid="game-canvas"]').isVisible().catch(() => false);
    expect(hudVisible || victoryVisible || canvasVisible, 'Game should still be running or show victory').toBe(true);

    if (pageErrors.length > 0) {
      test.info().annotations.push({
        type: 'note',
        description: `Uncaught errors after rounds: ${pageErrors.join(' | ')}`,
      });
    }

    expect(pageErrors, 'no uncaught errors after multiple audio triggers').toHaveLength(0);
  });
});
