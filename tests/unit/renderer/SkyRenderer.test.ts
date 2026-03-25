import { createSkyGradient, renderSky } from '@renderer/sky/SkyRenderer';
import { describe, expect, it, vi } from 'vitest';

function createMockContext(): CanvasRenderingContext2D {
  const mockGradient = {
    addColorStop: vi.fn(),
  };
  return {
    createLinearGradient: vi.fn(() => mockGradient),
    fillRect: vi.fn(),
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D;
}

describe('SkyRenderer', () => {
  describe('createSkyGradient', () => {
    it('should create a linear gradient from top to bottom', () => {
      const ctx = createMockContext();
      createSkyGradient(ctx, 800, 600);
      expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, 0, 0, 600);
    });

    it('should use custom stops when provided', () => {
      const ctx = createMockContext();
      const customStops = [
        { offset: 0, color: '#000' },
        { offset: 1, color: '#fff' },
      ];
      const gradient = createSkyGradient(ctx, 800, 600, customStops);
      const mockGradient = gradient as unknown as { addColorStop: ReturnType<typeof vi.fn> };
      expect(mockGradient.addColorStop).toHaveBeenCalledTimes(2);
    });
  });

  describe('renderSky', () => {
    it('should fill the full canvas area', () => {
      const ctx = createMockContext();
      renderSky(ctx, 800, 600);
      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });
  });
});
