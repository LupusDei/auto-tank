import { expect, test } from '@playwright/test';
import { launchGame } from './helpers';

test.describe('Visual Regression', () => {
  test('should capture initial game state screenshot', async ({ page }) => {
    await launchGame(page);
    await page.waitForTimeout(500);

    // Full page screenshot
    await expect(page).toHaveScreenshot('initial-game-state.png', {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    });
  });

  test('should capture canvas-only screenshot', async ({ page }) => {
    await launchGame(page);
    await page.waitForTimeout(500);

    const canvas = page.locator('[data-testid="game-canvas"]');
    await expect(canvas).toHaveScreenshot('canvas-render.png', {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    });
  });

  test('should capture HUD screenshot', async ({ page }) => {
    await launchGame(page);
    await page.waitForTimeout(300);

    const hud = page.locator('[data-testid="game-hud"]');
    await expect(hud).toHaveScreenshot('hud-overlay.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
