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

    // HUD should still be visible
    const hud = getHUD(page);
    await expect(hud).toBeVisible();

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
      await pressKey(page, 'Space');
      // Wait for projectile resolution and turn advance
      await page.waitForTimeout(5_000);
    }

    // Game should still be running
    const hud = getHUD(page);
    await expect(hud).toBeVisible();

    if (pageErrors.length > 0) {
      test.info().annotations.push({
        type: 'note',
        description: `Uncaught errors after 3 rounds: ${pageErrors.join(' | ')}`,
      });
    }

    expect(pageErrors, 'no uncaught errors after multiple audio triggers').toHaveLength(0);
  });
});
