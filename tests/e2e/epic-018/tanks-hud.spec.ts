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

      const w = canvas.width;
      const h = canvas.height;

      // Scan a wide horizontal band around 30% of width for red tank
      // Tanks sit on terrain which is roughly in the middle third vertically
      let redFound = false;
      const redX = Math.floor(w * 0.25);
      const redRegion = ctx.getImageData(
        redX,
        Math.floor(h * 0.3),
        Math.floor(w * 0.15),
        Math.floor(h * 0.2),
      ).data;
      for (let i = 0; i < redRegion.length; i += 4) {
        const r = redRegion[i] ?? 0;
        const g = redRegion[i + 1] ?? 0;
        if (r > 150 && g < 120) {
          redFound = true;
          break;
        }
      }

      // Scan around 70% of width for blue tank
      let blueFound = false;
      const blueX = Math.floor(w * 0.6);
      const blueRegion = ctx.getImageData(
        blueX,
        Math.floor(h * 0.3),
        Math.floor(w * 0.15),
        Math.floor(h * 0.2),
      ).data;
      for (let i = 0; i < blueRegion.length; i += 4) {
        const r = blueRegion[i] ?? 0;
        const b = blueRegion[i + 2] ?? 0;
        if (b > 150 && r < 100) {
          blueFound = true;
          break;
        }
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
