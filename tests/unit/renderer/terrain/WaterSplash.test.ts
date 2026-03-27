import {
  createWaterSplash,
  isWaterSplashComplete,
  renderWaterSplash,
} from '@renderer/terrain/WaterSplash';
import { describe, expect, it, vi } from 'vitest';

function createMockCanvas(): CanvasRenderingContext2D {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('WaterSplash', () => {
  describe('createWaterSplash', () => {
    it('should create a splash with given position', () => {
      const splash = createWaterSplash(200, 0.8);
      expect(splash.x).toBe(200);
      expect(splash.intensity).toBe(0.8);
      expect(splash.startTime).toBeGreaterThanOrEqual(0);
    });

    it('should use default intensity of 0.5 when not specified', () => {
      const splash = createWaterSplash(100);
      expect(splash.intensity).toBe(0.5);
    });
  });

  describe('isWaterSplashComplete', () => {
    it('should return false when splash just started', () => {
      const splash = createWaterSplash(100);
      expect(isWaterSplashComplete(splash, splash.startTime + 100)).toBe(false);
    });

    it('should return true after 800ms', () => {
      const splash = createWaterSplash(100);
      expect(isWaterSplashComplete(splash, splash.startTime + 900)).toBe(true);
    });
  });

  describe('renderWaterSplash', () => {
    it('should draw splash droplets on canvas', () => {
      const ctx = createMockCanvas();
      const splash = createWaterSplash(200, 0.8);
      renderWaterSplash(ctx, splash, 600, 30, splash.startTime + 200);
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('should save and restore canvas state', () => {
      const ctx = createMockCanvas();
      const splash = createWaterSplash(200);
      renderWaterSplash(ctx, splash, 600, 30, splash.startTime + 200);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });
  });
});
