import { describe, expect, it, vi } from 'vitest';
import { getDefaultWaterConfig, renderWater } from '@renderer/terrain/WaterRenderer';
import type { WaterConfig } from '@renderer/terrain/WaterRenderer';

function createMockCanvas(): CanvasRenderingContext2D {
  const mockGradient = {
    addColorStop: vi.fn(),
  };
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
    quadraticCurveTo: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue(mockGradient),
  } as unknown as CanvasRenderingContext2D;
}

describe('WaterRenderer', () => {
  describe('getDefaultWaterConfig', () => {
    it('should return valid default config', () => {
      const config = getDefaultWaterConfig();
      expect(config.waterLevel).toBe(30);
      expect(config.waveAmplitude).toBe(4);
      expect(config.waveFrequency).toBe(3);
      expect(config.color).toBe('#1a6bb5');
      expect(config.foamColor).toBe('#88ccee');
    });
  });

  describe('renderWater', () => {
    it('should draw water body on canvas', () => {
      const ctx = createMockCanvas();
      renderWater(ctx, 800, 600, 0);
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('should create a vertical gradient for water', () => {
      const ctx = createMockCanvas();
      renderWater(ctx, 800, 600, 0);
      expect(ctx.createLinearGradient).toHaveBeenCalled();
    });

    it('should save and restore context for alpha', () => {
      const ctx = createMockCanvas();
      renderWater(ctx, 800, 600, 0);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('should accept custom water config', () => {
      const ctx = createMockCanvas();
      const config: WaterConfig = {
        waterLevel: 50,
        waveAmplitude: 8,
        waveFrequency: 5,
        color: '#0000ff',
        foamColor: '#ffffff',
      };
      renderWater(ctx, 800, 600, 0, config);
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('should animate differently at different elapsed times', () => {
      const ctx1 = createMockCanvas();
      const ctx2 = createMockCanvas();
      renderWater(ctx1, 800, 600, 0);
      renderWater(ctx2, 800, 600, 1000);

      const calls1 = (ctx1.lineTo as ReturnType<typeof vi.fn>).mock.calls;
      const calls2 = (ctx2.lineTo as ReturnType<typeof vi.fn>).mock.calls;
      // Wave positions should differ at different times
      expect(calls1).not.toEqual(calls2);
    });
  });
});
