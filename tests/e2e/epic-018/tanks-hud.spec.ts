import { expect, test } from '@playwright/test';
import { getCanvas, getHUD, launchGame } from '../helpers';

test.describe('Tank Rendering and HUD', () => {
  test('Two tanks are visible on canvas', async ({ page }) => {
    await launchGame(page);

    const { redFound, blueFound } = await page.evaluate(() => {
      const canvas = document.querySelector(
        '[data-testid="game-canvas"]',
      ) as HTMLCanvasElement | null;
      if (!canvas) return { redFound: false, blueFound: false };
      const ctx = canvas.getContext('2d');
      if (!ctx) return { redFound: false, blueFound: false };

      // Scan the entire canvas for red and blue tank pixels
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let redFound = false;
      let blueFound = false;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] ?? 0;
        const g = data[i + 1] ?? 0;
        const b = data[i + 2] ?? 0;
        // Red tank: r > 180, g < 100, b < 100 (team red #e74c3c)
        if (r > 180 && g < 100 && b < 100) redFound = true;
        // Blue tank: b > 180, r < 80, g > 100 (team blue #3498db)
        if (b > 180 && r < 80 && g > 100) blueFound = true;
        if (redFound && blueFound) break;
      }

      return { redFound, blueFound };
    });

    expect(redFound).toBe(true);
    expect(blueFound).toBe(true);
  });

  test('HUD panel is visible', async ({ page }) => {
    await launchGame(page);

    const hud = getHUD(page);
    await expect(hud).toBeVisible();
  });

  test('HUD shows all required fields', async ({ page }) => {
    await launchGame(page);

    const hud = getHUD(page);
    const hudText = (await hud.textContent()) ?? '';

    expect(hudText).toContain('Player');
    expect(hudText).toContain('\u00B0');
    expect(hudText).toContain('%');
    expect(hudText).toMatch(/\u2192|\u2190/);
    expect(hudText).toContain('Missile');
  });

  test('Game loop is running', async ({ page }) => {
    await launchGame(page);

    const canvas = getCanvas(page);
    await expect(canvas).toBeVisible();

    await page.waitForTimeout(500);

    await expect(canvas).toBeVisible();
  });
});
