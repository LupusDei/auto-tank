import { canvasHasContent, getCanvas, getHUD, launchGame } from './helpers';
import { expect, test } from '@playwright/test';

test.describe('Test Infrastructure', () => {
  test('should launch game and find canvas', async ({ page }) => {
    await launchGame(page);
    const canvas = getCanvas(page);
    await expect(canvas).toBeVisible();
  });

  test('should find HUD overlay', async ({ page }) => {
    await launchGame(page);
    const hud = getHUD(page);
    await expect(hud).toBeVisible();
  });

  test('should render content on canvas', async ({ page }) => {
    await launchGame(page);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Auto Tank/i);
  });
});
