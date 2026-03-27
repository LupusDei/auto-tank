import { describe, expect, it, vi } from 'vitest';
import { renderCrate, renderParachute } from '@renderer/effects/CrateRenderer';

function createMockContext(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    closePath: vi.fn(),
    strokeRect: vi.fn(),
    setLineDash: vi.fn(),
    shadowBlur: 0,
    shadowColor: '',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: '' as CanvasTextAlign,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('CrateRenderer', () => {
  describe('renderCrate', () => {
    it('should call drawing methods for a falling crate', () => {
      const ctx = createMockContext();
      renderCrate(ctx, { position: { x: 100, y: 50 }, state: 'falling', elapsed: 500 });
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('should render glow effect for landed crate', () => {
      const ctx = createMockContext();
      renderCrate(ctx, { position: { x: 100, y: 300 }, state: 'landed', elapsed: 1000 });
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.strokeRect).toHaveBeenCalled();
    });

    it('should not render a collected crate', () => {
      const ctx = createMockContext();
      renderCrate(ctx, { position: { x: 100, y: 300 }, state: 'collected', elapsed: 0 });
      expect(ctx.fillRect).not.toHaveBeenCalled();
    });
  });

  describe('renderParachute', () => {
    it('should draw parachute lines and canopy', () => {
      const ctx = createMockContext();
      renderParachute(ctx, { x: 100, y: 50 }, 500);
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
    });
  });
});
