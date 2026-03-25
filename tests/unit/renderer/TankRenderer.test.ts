import { describe, expect, it, vi } from 'vitest';
import {
  getTeamHexColor,
  renderHealthBar,
  renderTank,
  renderTankWithHealth,
} from '@renderer/entities/TankRenderer';

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

  describe('renderHealthBar', () => {
    it('should draw health bar background and fill', () => {
      const ctx = createMockCanvas();
      renderHealthBar(ctx, 100, 200, 75, 100);
      // Two fillRect calls: background + health fill
      expect(ctx.fillRect).toHaveBeenCalledTimes(2);
    });

    it('should use green color for high health', () => {
      const ctx = createMockCanvas();
      renderHealthBar(ctx, 100, 200, 80, 100);
      expect(ctx.fillStyle).toBe('#2ecc71');
    });

    it('should use red color for low health', () => {
      const ctx = createMockCanvas();
      renderHealthBar(ctx, 100, 200, 10, 100);
      expect(ctx.fillStyle).toBe('#e74c3c');
    });
  });

  describe('renderTankWithHealth', () => {
    it('should render both tank and health bar', () => {
      const ctx = createMockCanvas();
      renderTankWithHealth(ctx, { x: 100, y: 200, angle: 45, color: 'blue' }, 50, 100);
      // Tank body + treads + health bg + health fill = 4 fillRect calls
      expect(ctx.fillRect).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalled();
    });
  });
});
