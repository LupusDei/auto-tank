import { describe, expect, it } from 'vitest';
import { applyWallBehavior } from '@engine/physics/WallBehavior';

describe('WallBehavior', () => {
  const worldWidth = 1000;

  describe('open mode', () => {
    it('should return null for any position (let OOB handle it)', () => {
      const result = applyWallBehavior({ x: -5, y: 100 }, { x: -10, y: 5 }, worldWidth, 'open');
      expect(result).toBeNull();
    });

    it('should return null even for positions within bounds', () => {
      const result = applyWallBehavior({ x: 500, y: 100 }, { x: 10, y: 5 }, worldWidth, 'open');
      expect(result).toBeNull();
    });
  });

  describe('wrap mode', () => {
    it('should wrap projectile at x < 0 to the right side', () => {
      const result = applyWallBehavior({ x: -5, y: 100 }, { x: -10, y: 5 }, worldWidth, 'wrap');
      if (!result) throw new Error('expected non-null');
      expect(result.position.x).toBe(995);
      expect(result.position.y).toBe(100);
      // Velocity unchanged in wrap
      expect(result.velocity.x).toBe(-10);
      expect(result.velocity.y).toBe(5);
    });

    it('should wrap projectile at x > worldWidth to the left side', () => {
      const result = applyWallBehavior({ x: 1010, y: 200 }, { x: 15, y: -3 }, worldWidth, 'wrap');
      if (!result) throw new Error('expected non-null');
      expect(result.position.x).toBe(10);
      expect(result.position.y).toBe(200);
    });

    it('should return null when projectile is within bounds', () => {
      const result = applyWallBehavior({ x: 500, y: 100 }, { x: 10, y: 5 }, worldWidth, 'wrap');
      expect(result).toBeNull();
    });
  });

  describe('bounce mode', () => {
    it('should reflect velocity when hitting left wall (x < 0)', () => {
      const result = applyWallBehavior({ x: -5, y: 100 }, { x: -10, y: 5 }, worldWidth, 'bounce');
      if (!result) throw new Error('expected non-null');
      expect(result.position.x).toBe(5);
      expect(result.position.y).toBe(100);
      expect(result.velocity.x).toBe(10); // reflected
      expect(result.velocity.y).toBe(5); // unchanged
    });

    it('should reflect velocity when hitting right wall (x > worldWidth)', () => {
      const result = applyWallBehavior({ x: 1005, y: 200 }, { x: 15, y: -3 }, worldWidth, 'bounce');
      if (!result) throw new Error('expected non-null');
      expect(result.position.x).toBe(995);
      expect(result.position.y).toBe(200);
      expect(result.velocity.x).toBe(-15); // reflected
      expect(result.velocity.y).toBe(-3); // unchanged
    });

    it('should return null when projectile is within bounds', () => {
      const result = applyWallBehavior({ x: 500, y: 100 }, { x: 10, y: 5 }, worldWidth, 'bounce');
      expect(result).toBeNull();
    });
  });
});
