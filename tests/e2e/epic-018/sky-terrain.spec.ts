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

    const pixels = await page.evaluate(() => {
      const canvas = document.querySelector(
        '[data-testid="game-canvas"]',
      ) as HTMLCanvasElement | null;
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const sample = (x: number, y: number) => {
        const data = ctx.getImageData(x, y, 1, 1).data;
        return { r: data[0] ?? 0, g: data[1] ?? 0, b: data[2] ?? 0, a: data[3] ?? 0 };
      };

      // Sample at ~45% of canvas height — the terrain boundary zone
      // where some columns are sky and some are terrain
      const y = Math.floor(canvas.height * 0.45);
      return [
        sample(Math.floor(canvas.width * 0.1), y),
        sample(Math.floor(canvas.width * 0.4), y),
        sample(Math.floor(canvas.width * 0.8), y),
      ];
    });

    expect(pixels).not.toBeNull();
    if (!pixels) return;
    const [p1, p2, p3] = pixels;
    const allSame =
      p1.r === p2.r &&
      p2.r === p3.r &&
      p1.g === p2.g &&
      p2.g === p3.g &&
      p1.b === p2.b &&
      p2.b === p3.b;
    expect(allSame).toBe(false);
  });

  test('Canvas renders non-transparent content', async ({ page }) => {
    await launchGame(page);

    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});
