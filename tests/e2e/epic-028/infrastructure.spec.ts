import { canvasHasContent, getCanvas, getHUD, launchGame, pressKey } from '../helpers';
import { expect, test } from '@playwright/test';

test.describe('E2E Infrastructure', () => {
  test('Game page loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Auto Tank/);
    await expect(getCanvas(page)).toBeVisible();
    await expect(getHUD(page)).toBeVisible();
  });

  test('Canvas renders content', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });

  test('Rapid keyboard input does not crash', async ({ page }) => {
    await launchGame(page);
    await pressKey(page, 'ArrowUp', 10);
    await pressKey(page, 'ArrowDown', 10);
    await pressKey(page, 'ArrowLeft', 10);
    await pressKey(page, 'ArrowRight', 10);
    await pressKey(page, 'Space', 10);
    await pressKey(page, 'Tab', 10);
    await expect(getCanvas(page)).toBeVisible();
    await expect(getHUD(page)).toBeVisible();
  });

  test('Page handles viewport resize', async ({ page }) => {
    await launchGame(page);
    await page.setViewportSize({ width: 640, height: 480 });
    await page.waitForTimeout(500);
    await page.setViewportSize({ width: 800, height: 600 });
    await expect(getCanvas(page)).toBeVisible();
  });
});
