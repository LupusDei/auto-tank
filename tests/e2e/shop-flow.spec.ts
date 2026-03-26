import { expect, test } from '@playwright/test';
import { getCanvas, launchGame } from './helpers';

test.describe('Shop Flow E2E', () => {
  test('should load game with canvas ready for shop integration', async ({ page }) => {
    await launchGame(page);
    await expect(getCanvas(page)).toBeVisible();
  });

  test('should maintain game state after navigation keys', async ({ page }) => {
    await launchGame(page);
    // Simulate browsing through weapons
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    await expect(getCanvas(page)).toBeVisible();
  });

  test('should render HUD with weapon info for shop context', async ({ page }) => {
    await launchGame(page);
    const hud = page.locator('[data-testid="game-hud"]');
    await expect(hud).toContainText('Weapon');
  });
});
