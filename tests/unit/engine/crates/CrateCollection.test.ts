import { applyCrateContent, checkCratePickup } from '@engine/crates/CrateCollection';
import { describe, expect, it } from 'vitest';
import type { Crate } from '@engine/crates/CrateSystem';

function makeCrate(x: number, y: number, overrides?: Partial<Crate>): Crate {
  return {
    id: 'crate-1',
    position: { x, y },
    content: { type: 'health', amount: 25 },
    state: 'landed',
    fallSpeed: 40,
    ...overrides,
  };
}

describe('CrateCollection', () => {
  describe('checkCratePickup', () => {
    it('should return true when tank is within pickup radius', () => {
      const crate = makeCrate(100, 200);
      expect(checkCratePickup({ x: 110, y: 200 }, crate)).toBe(true);
    });

    it('should return false when tank is outside pickup radius', () => {
      const crate = makeCrate(100, 200);
      expect(checkCratePickup({ x: 200, y: 200 }, crate)).toBe(false);
    });

    it('should use default 30px radius', () => {
      const crate = makeCrate(100, 200);
      expect(checkCratePickup({ x: 129, y: 200 }, crate)).toBe(true);
      expect(checkCratePickup({ x: 131, y: 200 }, crate)).toBe(false);
    });

    it('should support custom pickup radius', () => {
      const crate = makeCrate(100, 200);
      expect(checkCratePickup({ x: 150, y: 200 }, crate, 60)).toBe(true);
      expect(checkCratePickup({ x: 150, y: 200 }, crate, 40)).toBe(false);
    });
  });

  describe('applyCrateContent', () => {
    it('should add money for money crate', () => {
      const result = applyCrateContent({ type: 'money', amount: 3000 }, 5000, 80, 100);
      expect(result.money).toBe(8000);
      expect(result.health).toBe(80);
    });

    it('should add health for health crate, clamped to max', () => {
      const result = applyCrateContent({ type: 'health', amount: 25 }, 5000, 90, 100);
      expect(result.health).toBe(100);
      expect(result.money).toBe(5000);
    });

    it('should return weapon info for weapon crate', () => {
      const result = applyCrateContent(
        { type: 'weapon', weaponType: 'missile', quantity: 2 },
        5000,
        80,
        100,
      );
      expect(result.weaponAdded).toEqual({ type: 'missile', quantity: 2 });
      expect(result.money).toBe(5000);
      expect(result.health).toBe(80);
    });
  });
});
