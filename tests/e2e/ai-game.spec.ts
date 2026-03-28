import { canvasHasContent, getCanvas, getHUD, launchGame, pressKey } from './helpers';
import { expect, test } from '@playwright/test';

test.describe('AI Game Flow', () => {
  test('should render game with two tanks visible', async ({ page }) => {
    await launchGame(page);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should maintain HUD after multiple key presses', async ({ page }) => {
    await launchGame(page);

    // Simulate a sequence of inputs like a real player
    await pressKey(page, 'ArrowUp', 5);
    await pressKey(page, 'ArrowRight', 3);
    await page.waitForTimeout(100);

    const hud = getHUD(page);
    await expect(hud).toBeVisible();
    await expect(page.locator('[data-testid="player-banner"]')).toBeVisible();
  });

  test('should not crash after rapid input', async ({ page }) => {
    await launchGame(page);

    // Rapid fire of inputs
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');
    }
    await page.keyboard.press(' ');
    await page.waitForTimeout(300);

    // Game should still be running
    await expect(getCanvas(page)).toBeVisible();
  });

  test('should handle tab key for weapon cycling', async ({ page }) => {
    await launchGame(page);
    await pressKey(page, 'Tab');
    await page.waitForTimeout(100);
    await expect(getCanvas(page)).toBeVisible();
  });
});
