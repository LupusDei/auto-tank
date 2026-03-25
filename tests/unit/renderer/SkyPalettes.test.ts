import { describe, expect, it, vi } from 'vitest';
import { generateClouds, getSkyPalette, renderClouds } from '@renderer/sky/SkyPalettes';

describe('SkyPalettes', () => {
  it('should return gradient stops for each time of day', () => {
    expect(getSkyPalette('dawn').length).toBeGreaterThan(0);
    expect(getSkyPalette('day').length).toBeGreaterThan(0);
    expect(getSkyPalette('dusk').length).toBeGreaterThan(0);
    expect(getSkyPalette('night').length).toBeGreaterThan(0);
  });

  it('should have stops sorted by offset', () => {
    for (const time of ['dawn', 'day', 'dusk', 'night'] as const) {
      const stops = getSkyPalette(time);
      for (let i = 1; i < stops.length; i++) {
        const prev = stops[i - 1];
        const curr = stops[i];
        if (prev && curr) {
          expect(curr.offset).toBeGreaterThanOrEqual(prev.offset);
        }
      }
    }
  });
});

describe('generateClouds', () => {
  it('should generate correct number of clouds', () => {
    const clouds = generateClouds(5, 800, 42);
    expect(clouds).toHaveLength(5);
  });

  it('should produce deterministic results for same seed', () => {
    const c1 = generateClouds(3, 800, 42);
    const c2 = generateClouds(3, 800, 42);
    expect(c1).toEqual(c2);
  });

  it('should produce clouds within canvas width', () => {
    const clouds = generateClouds(10, 800, 42);
    for (const c of clouds) {
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.x).toBeLessThanOrEqual(800);
    }
  });
});

describe('renderClouds', () => {
  it('should render each cloud as an ellipse', () => {
    const ctx = {
      beginPath: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      fillStyle: '',
    } as unknown as CanvasRenderingContext2D;

    const clouds = generateClouds(3, 800, 42);
    renderClouds(ctx, clouds, 0, 800);

    expect(ctx.ellipse).toHaveBeenCalledTimes(3);
    expect(ctx.fill).toHaveBeenCalledTimes(3);
  });
});
