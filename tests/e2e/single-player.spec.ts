import { expect, test } from '@playwright/test';
import { getCanvas, getHUD, launchGame, pressKey } from './helpers';

test.describe('Single Player Flow', () => {
  test('should display game canvas and HUD on load', async ({ page }) => {
    await launchGame(page);
    await expect(getCanvas(page)).toBeVisible();
    await expect(getHUD(page)).toBeVisible();
  });

  test('should show player info in HUD', async ({ page }) => {
    await launchGame(page);
    const hud = getHUD(page);
    await expect(hud).toContainText('Player');
    await expect(hud).toContainText('Angle');
    await expect(hud).toContainText('Power');
    await expect(hud).toContainText('Wind');
  });

  test('should show weapon name in HUD', async ({ page }) => {
    await launchGame(page);
    const hud = getHUD(page);
    await expect(hud).toContainText('Weapon');
  });

  test('should respond to keyboard input without errors', async ({ page }) => {
    await launchGame(page);
    // Press arrow keys (angle/power adjust)
    await pressKey(page, 'ArrowUp', 3);
    await pressKey(page, 'ArrowDown', 2);
    await pressKey(page, 'ArrowLeft', 2);
    await pressKey(page, 'ArrowRight', 2);

    // Canvas should still be visible and rendering
    await expect(getCanvas(page)).toBeVisible();
  });

  test('should handle space key press without crash', async ({ page }) => {
    await launchGame(page);
    await pressKey(page, ' ');
    await page.waitForTimeout(200);
    await expect(getCanvas(page)).toBeVisible();
  });
});
