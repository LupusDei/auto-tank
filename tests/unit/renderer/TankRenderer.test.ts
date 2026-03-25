import { describe, expect, it, vi } from 'vitest';
import { getTeamHexColor, renderTank } from '@renderer/entities/TankRenderer';

function createMockCanvas(): CanvasRenderingContext2D {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    closePath: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('TankRenderer', () => {
  describe('getTeamHexColor', () => {
    it('should return red hex for red team', () => {
      expect(getTeamHexColor('red')).toBe('#e74c3c');
    });

    it('should return blue hex for blue team', () => {
      expect(getTeamHexColor('blue')).toBe('#3498db');
    });

    it('should return a valid hex color for all team colors', () => {
      const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'] as const;
      for (const color of colors) {
        const hex = getTeamHexColor(color);
        expect(hex).toMatch(/^#[0-9a-f]{6}$/);
      }
    });
  });

  describe('renderTank', () => {
    it('should render a tank body', () => {
      const ctx = createMockCanvas();
      renderTank(ctx, { x: 100, y: 200, angle: 45, color: 'red' });
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('should render turret dome', () => {
      const ctx = createMockCanvas();
      renderTank(ctx, { x: 100, y: 200, angle: 45, color: 'blue' });
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('should render the barrel', () => {
      const ctx = createMockCanvas();
      renderTank(ctx, { x: 100, y: 200, angle: 90, color: 'green' });
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('should use custom dimensions when provided', () => {
      const ctx = createMockCanvas();
      renderTank(ctx, {
        x: 100,
        y: 200,
        angle: 45,
        color: 'red',
        barrelLength: 30,
        bodyWidth: 40,
        bodyHeight: 20,
      });
      expect(ctx.fillRect).toHaveBeenCalled();
    });
  });
});
