import { expect, test } from '@playwright/test';

import { launchGame } from '../helpers';

test.describe('Epic 048 Behavior: Terrain Visual Variety & Randomness', () => {
  test('Terrain has visual variety — not flat-filled with one color', async ({ page }) => {
    test.setTimeout(30_000);
    await launchGame(page);

    // Sample pixels at multiple positions in the terrain area (lower 40% of canvas)
    const terrainColors = await page.evaluate(() => {
      const canvas = document.querySelector(
        '[data-testid="game-canvas"]',
      ) as HTMLCanvasElement | null;
      if (!canvas) return { uniqueColors: 0, samplePoints: 0, colors: [] as string[] };
      const ctx = canvas.getContext('2d');
      if (!ctx) return { uniqueColors: 0, samplePoints: 0, colors: [] as string[] };

      const w = canvas.width;
      const h = canvas.height;
      const terrainTop = Math.floor(h * 0.6);
      const terrainHeight = h - terrainTop;

      const colorSet = new Set<string>();
      const sampleColors: string[] = [];
      let samplePoints = 0;

      // Sample a grid of points across the terrain region
      for (let col = 0; col < 20; col++) {
        for (let row = 0; row < 10; row++) {
          const x = Math.floor((col / 20) * w);
          const y = terrainTop + Math.floor((row / 10) * terrainHeight);
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          const r = pixel[0] ?? 0;
          const g = pixel[1] ?? 0;
          const b = pixel[2] ?? 0;
          const a = pixel[3] ?? 0;
          if (a > 0) {
            samplePoints++;
            // Quantize to 16 levels per channel to group similar colors
            const key = `${Math.floor(r / 16)}-${Math.floor(g / 16)}-${Math.floor(b / 16)}`;
            colorSet.add(key);
            if (sampleColors.length < 30) {
              sampleColors.push(`rgb(${r},${g},${b})`);
            }
          }
        }
      }

      return {
        uniqueColors: colorSet.size,
        samplePoints,
        colors: sampleColors,
      };
    });

    test.info().annotations.push({
      type: 'note',
      description:
        `Terrain sample: ${terrainColors.samplePoints} opaque pixels, ` +
        `${terrainColors.uniqueColors} unique colors (quantized to 16 levels). ` +
        `Sample: ${terrainColors.colors.slice(0, 10).join(', ')}`,
    });

    // Terrain should have visual variety: gradient, texture, detail marks
    // A flat-filled terrain would have 1-2 colors; real terrain should have >3
    expect(
      terrainColors.uniqueColors,
      `Terrain has only ${terrainColors.uniqueColors} distinct colors. ` +
        'Expected >3 for gradient/textured terrain. Flat-fill detected.',
    ).toBeGreaterThan(3);

    // Also verify we actually sampled terrain pixels
    expect(
      terrainColors.samplePoints,
      'Should find opaque pixels in terrain region (lower 40%)',
    ).toBeGreaterThan(10);
  });

  test('Canvas renders differently with each game — terrain is random', async ({ page }) => {
    test.setTimeout(45_000);

    // Game 1: launch and capture terrain hash
    await launchGame(page);

    const hash1 = await page.evaluate(() => {
      const canvas = document.querySelector(
        '[data-testid="game-canvas"]',
      ) as HTMLCanvasElement | null;
      if (!canvas) return 0;
      const ctx = canvas.getContext('2d');
      if (!ctx) return 0;
      const w = canvas.width;
      const h = canvas.height;
      // Hash just the terrain region
      const region = ctx.getImageData(0, Math.floor(h * 0.5), w, Math.floor(h * 0.5));
      let hash = 0;
      for (let i = 0; i < region.data.length; i += 4) {
        hash = ((hash << 5) - hash + (region.data[i] ?? 0)) | 0;
      }
      return hash;
    });

    // Navigate back to main menu
    await page.goto('/');
    await page.waitForTimeout(500);

    // Game 2: launch again and capture terrain hash
    await launchGame(page);

    const hash2 = await page.evaluate(() => {
      const canvas = document.querySelector(
        '[data-testid="game-canvas"]',
      ) as HTMLCanvasElement | null;
      if (!canvas) return 0;
      const ctx = canvas.getContext('2d');
      if (!ctx) return 0;
      const w = canvas.width;
      const h = canvas.height;
      const region = ctx.getImageData(0, Math.floor(h * 0.5), w, Math.floor(h * 0.5));
      let hash = 0;
      for (let i = 0; i < region.data.length; i += 4) {
        hash = ((hash << 5) - hash + (region.data[i] ?? 0)) | 0;
      }
      return hash;
    });

    test.info().annotations.push({
      type: 'note',
      description: `Game 1 terrain hash: ${hash1}, Game 2 terrain hash: ${hash2}`,
    });

    // The two games should produce different terrain
    // If terrain is seeded/random, pixel hashes should differ
    expect(
      hash1 !== hash2,
      `Both games produced identical terrain (hash=${hash1}). ` +
        'Terrain generation should be random/seeded differently each game.',
    ).toBe(true);
  });
});
