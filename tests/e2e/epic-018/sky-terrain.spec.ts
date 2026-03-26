import { canvasHasContent, launchGame } from '../helpers';
import { expect, test } from '@playwright/test';

test.describe('Sky and Terrain Rendering', () => {
  test('Sky gradient is visible', async ({ page }) => {
    await launchGame(page);

    const pixel = await page.evaluate(() => {
      const canvas = document.querySelector(
        '[data-testid="game-canvas"]',
      ) as HTMLCanvasElement | null;
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const data = ctx.getImageData(400, 10, 1, 1).data;
      return { r: data[0] ?? 0, g: data[1] ?? 0, b: data[2] ?? 0, a: data[3] ?? 0 };
    });

    expect(pixel).not.toBeNull();
    if (pixel) {
      expect(pixel.r > 0 || pixel.g > 0 || pixel.b > 0).toBe(true);
    }
  });

  test('Terrain polygon is drawn', async ({ page }) => {
    await launchGame(page);

    const pixel = await page.evaluate(() => {
      const canvas = document.querySelector(
        '[data-testid="game-canvas"]',
      ) as HTMLCanvasElement | null;
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const data = ctx.getImageData(400, 500, 1, 1).data;
      return { r: data[0] ?? 0, g: data[1] ?? 0, b: data[2] ?? 0, a: data[3] ?? 0 };
    });

    expect(pixel).not.toBeNull();
    if (pixel) {
      expect(pixel.g).toBeGreaterThan(0);
    }
  });

  test('Terrain has irregular height profile', async ({ page }) => {
    await launchGame(page);

    // Scan a vertical column to find where sky transitions to terrain
    // If the terrain has hills, different x-columns will have different transition points
    const result = await page.evaluate(() => {
      const canvas = document.querySelector(
        '[data-testid="game-canvas"]',
      ) as HTMLCanvasElement | null;
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Find the first green pixel in each column (terrain boundary)
      const ch = canvas.height;
      const context = ctx;
      function findTerrainTop(x: number): number {
        for (let y = 0; y < ch; y++) {
          const data = context.getImageData(x, y, 1, 1).data;
          const g = data[1] ?? 0;
          const r = data[0] ?? 0;
          if (g > 50 && g > r) return y;
        }
        return ch;
      }

      const col1 = findTerrainTop(Math.floor(canvas.width * 0.2));
      const col2 = findTerrainTop(Math.floor(canvas.width * 0.5));
      const col3 = findTerrainTop(Math.floor(canvas.width * 0.8));

      return { col1, col2, col3, allSame: col1 === col2 && col2 === col3 };
    });

    expect(result).not.toBeNull();
    if (!result) return;
    // At least one column should have a different terrain height
    expect(result.allSame).toBe(false);
  });

  test('Canvas renders non-transparent content', async ({ page }) => {
    await launchGame(page);

    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});
