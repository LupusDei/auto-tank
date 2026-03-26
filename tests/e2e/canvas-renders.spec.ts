import { canvasHasContent, getHUD, launchGame } from './helpers';
import { expect, test } from '@playwright/test';

test.describe('Canvas Rendering', () => {
  test('should load the page and display the main menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
    await expect(page.locator('[data-testid="main-menu"]')).toBeVisible();
  });

  test('should render the game HUD after starting', async ({ page }) => {
    await launchGame(page);
    const hud = getHUD(page);
    await expect(hud).toBeVisible();
    await expect(hud).toContainText('Player');
  });

  test('should render non-transparent pixels on canvas', async ({ page }) => {
    await launchGame(page);
    await page.waitForTimeout(300);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});
