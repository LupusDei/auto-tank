import { expect, test } from '@playwright/test';

test.describe('Canvas Rendering', () => {
  test('should load the page and display the canvas', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('[data-testid="game-canvas"]');
    await expect(canvas).toBeVisible();
  });

  test('should render the game HUD', async ({ page }) => {
    await page.goto('/');
    const hud = page.locator('[data-testid="game-hud"]');
    await expect(hud).toBeVisible();
    await expect(hud).toContainText('Player 1');
    await expect(hud).toContainText('Missile');
  });

  test('should render non-transparent pixels on canvas', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('[data-testid="game-canvas"]');
    await expect(canvas).toBeVisible();

    // Wait a frame for rendering
    await page.waitForTimeout(100);

    // Check that the canvas has rendered something (not all black)
    const hasContent = await page.evaluate(() => {
      const canvasEl = document.querySelector('[data-testid="game-canvas"]') as HTMLCanvasElement;
      if (!canvasEl) return false;
      const ctx = canvasEl.getContext('2d');
      if (!ctx) return false;
      const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
      // Check if any pixel is not pure black
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (
          (imageData.data[i] ?? 0) > 0 ||
          (imageData.data[i + 1] ?? 0) > 0 ||
          (imageData.data[i + 2] ?? 0) > 0
        ) {
          return true;
        }
      }
      return false;
    });

    expect(hasContent).toBe(true);
  });
});
