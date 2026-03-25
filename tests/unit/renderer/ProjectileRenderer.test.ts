import { describe, expect, it, vi } from 'vitest';
import { renderProjectile, renderTrail } from '@renderer/entities/ProjectileRenderer';

function createMockContext(): CanvasRenderingContext2D {
  return {
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('ProjectileRenderer', () => {
  it('should render projectile head as circle', () => {
    const ctx = createMockContext();
    renderProjectile(ctx, {
      position: { x: 100, y: 200 },
      trail: [
        { x: 90, y: 210 },
        { x: 100, y: 200 },
      ],
    });
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('should render glow effect', () => {
    const ctx = createMockContext();
    renderProjectile(ctx, {
      position: { x: 100, y: 200 },
      trail: [{ x: 100, y: 200 }],
    });
    // Two arcs: head + glow
    expect(ctx.arc).toHaveBeenCalledTimes(2);
  });

  it('should use custom color and radius', () => {
    const ctx = createMockContext();
    renderProjectile(ctx, {
      position: { x: 50, y: 50 },
      trail: [],
      color: '#00ff00',
      radius: 5,
    });
    expect(ctx.arc).toHaveBeenCalledWith(50, 50, 5, 0, Math.PI * 2);
  });
});

describe('renderTrail', () => {
  it('should not render trail with less than 2 points', () => {
    const ctx = createMockContext();
    renderTrail(ctx, [{ x: 0, y: 0 }], '#ff0000');
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it('should render trail segments', () => {
    const ctx = createMockContext();
    const trail = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 15 },
    ];
    renderTrail(ctx, trail, '#ff0000');
    expect(ctx.stroke).toHaveBeenCalledTimes(2);
  });
});
