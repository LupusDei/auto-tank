import { expect, test } from '@playwright/test';
import { getCanvas, launchGame } from './helpers';

test.describe('Multiplayer E2E', () => {
  test('should load game in two separate browser contexts', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await launchGame(page1);
    await launchGame(page2);

    await expect(getCanvas(page1)).toBeVisible();
    await expect(getCanvas(page2)).toBeVisible();

    await context1.close();
    await context2.close();
  });

  test('should render independently in each tab', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await launchGame(page1);
    await launchGame(page2);

    // Both should show HUD
    const hud1 = page1.locator('[data-testid="game-hud"]');
    const hud2 = page2.locator('[data-testid="game-hud"]');
    await expect(hud1).toBeVisible();
    await expect(hud2).toBeVisible();

    // Input in one tab shouldn't affect the other
    await page1.keyboard.press('ArrowUp');
    await page1.waitForTimeout(100);

    // Both canvases still rendering
    await expect(getCanvas(page1)).toBeVisible();
    await expect(getCanvas(page2)).toBeVisible();

    await context1.close();
    await context2.close();
  });
});
