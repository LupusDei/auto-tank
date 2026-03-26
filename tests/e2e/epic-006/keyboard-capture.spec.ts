import { expect, test } from '@playwright/test';
import { getCanvas, getHUD, launchGame, pressKey } from '../helpers';

test.describe('Keyboard Capture', () => {
  test('Page stability on arrow key press', async ({ page }) => {
    // 1. Navigate to the game page and wait for canvas + HUD
    await launchGame(page);

    const canvas = getCanvas(page);
    const hud = getHUD(page);

    // 2. Verify canvas and HUD are visible before input
    await expect(canvas).toBeVisible();
    await expect(hud).toBeVisible();

    // 3. Press ArrowLeft key
    await pressKey(page, 'ArrowLeft');

    // 4. Verify the page does not crash — canvas remains visible
    await expect(canvas).toBeVisible();

    // 5. Verify HUD remains visible
    await expect(hud).toBeVisible();
  });
});
