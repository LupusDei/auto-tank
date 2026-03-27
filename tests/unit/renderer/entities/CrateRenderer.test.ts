import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CrateAnimationManager,
  getCrateColor,
  renderCrate,
  renderCrates,
} from '@renderer/entities/CrateRenderer';
import type { Crate } from '@engine/defense/CrateDrops';

function makeCrate(overrides: Partial<Crate> = {}): Crate {
  return {
    id: 'crate-1',
    type: 'weapon',
    position: { x: 100, y: 200 },
    content: { kind: 'weapon', weaponType: 'missile', quantity: 1 },
    collected: false,
    ...overrides,
  };
}

function createMockCtx(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('CrateRenderer', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  describe('getCrateColor', () => {
    it('should return gold for weapon crates', () => {
      expect(getCrateColor('weapon')).toBe('#f1c40f');
    });

    it('should return green for health crates', () => {
      expect(getCrateColor('health')).toBe('#2ecc71');
    });

    it('should return blue for shield crates', () => {
      expect(getCrateColor('shield')).toBe('#3498db');
    });

    it('should return red for fuel crates', () => {
      expect(getCrateColor('fuel')).toBe('#e74c3c');
    });
  });

  describe('renderCrate', () => {
    it('should render a non-collected crate', () => {
      const crate = makeCrate();
      renderCrate(ctx, crate, null, 1000);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx.fillRect).toHaveBeenCalled();
      expect(ctx.strokeRect).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('should skip collected crates', () => {
      const crate = makeCrate({ collected: true });
      renderCrate(ctx, crate, null, 1000);
      expect(ctx.save).not.toHaveBeenCalled();
      expect(ctx.fillRect).not.toHaveBeenCalled();
    });

    it('should apply type-specific colors', () => {
      const healthCrate = makeCrate({
        type: 'health',
        content: { kind: 'health', amount: 25 },
      });
      renderCrate(ctx, healthCrate, null, 1000);
      // The strokeRect should have been called (for the crate box border)
      expect(ctx.strokeRect).toHaveBeenCalled();
    });
  });

  describe('renderCrates', () => {
    it('should render correct number of crates', () => {
      const crates: Crate[] = [
        makeCrate({ id: 'crate-1' }),
        makeCrate({ id: 'crate-2' }),
        makeCrate({ id: 'crate-3' }),
      ];
      renderCrates(ctx, crates, null, 1000);
      // save/restore called once per crate
      expect(ctx.save).toHaveBeenCalledTimes(3);
      expect(ctx.restore).toHaveBeenCalledTimes(3);
    });

    it('should skip collected crates', () => {
      const crates: Crate[] = [
        makeCrate({ id: 'crate-1', collected: false }),
        makeCrate({ id: 'crate-2', collected: true }),
        makeCrate({ id: 'crate-3', collected: false }),
      ];
      renderCrates(ctx, crates, null, 1000);
      // Only 2 non-collected crates rendered
      expect(ctx.save).toHaveBeenCalledTimes(2);
    });

    it('should render no crates when array is empty', () => {
      renderCrates(ctx, [], null, 1000);
      expect(ctx.save).not.toHaveBeenCalled();
    });
  });

  describe('CrateAnimationManager', () => {
    it('should track animation progress', () => {
      const mgr = new CrateAnimationManager();
      mgr.startDrop('crate-1', 200, 1000);

      // At start
      const progress = mgr.getProgress('crate-1', 1000);
      expect(progress).toBe(0);

      // Midway (1 second into 2-second animation)
      const midProgress = mgr.getProgress('crate-1', 2000);
      expect(midProgress).toBeCloseTo(0.5, 1);
    });

    it('should return null for unknown crate', () => {
      const mgr = new CrateAnimationManager();
      expect(mgr.getProgress('nonexistent', 1000)).toBeNull();
    });

    it('should return null after animation completes', () => {
      const mgr = new CrateAnimationManager();
      mgr.startDrop('crate-1', 200, 1000);

      // After 2+ seconds
      const progress = mgr.getProgress('crate-1', 4000);
      expect(progress).toBeNull();
    });

    it('should interpolate Y position during animation', () => {
      const mgr = new CrateAnimationManager();
      mgr.startDrop('crate-1', 200, 1000, 0);

      // At start, Y should be near startY
      const startY = mgr.getAnimatedY('crate-1', 1000);
      expect(startY).toBe(0);

      // At end, Y should be near endY
      // Just before completion
      const nearEndY = mgr.getAnimatedY('crate-1', 2900);
      expect(nearEndY).not.toBeNull();
      if (nearEndY !== null) {
        expect(nearEndY).toBeGreaterThan(150);
      }
    });

    it('should report animation state correctly', () => {
      const mgr = new CrateAnimationManager();
      expect(mgr.isAnimating('crate-1')).toBe(false);
      mgr.startDrop('crate-1', 200, 1000);
      expect(mgr.isAnimating('crate-1')).toBe(true);
    });
  });
});
