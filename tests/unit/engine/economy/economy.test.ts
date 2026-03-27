import {
  calculateInterest,
  calculateRoundReward,
  canAfford,
  getStartingLoadout,
  purchaseWeapon,
} from '../../../../src/engine/economy';
import { describe, expect, it } from 'vitest';

describe('economy', () => {
  describe('canAfford', () => {
    it('returns true when money is sufficient', () => {
      expect(canAfford(1000, 500)).toBe(true);
    });

    it('returns true when money equals price exactly', () => {
      expect(canAfford(500, 500)).toBe(true);
    });

    it('returns false when money is insufficient', () => {
      expect(canAfford(100, 500)).toBe(false);
    });
  });

  describe('purchaseWeapon', () => {
    it('deducts money and increments quantity on successful purchase', () => {
      const result = purchaseWeapon(1000, 300, 2);
      expect(result).toEqual({ newMoney: 700, newQuantity: 3 });
    });

    it('returns null when player cannot afford the weapon', () => {
      const result = purchaseWeapon(100, 300, 2);
      expect(result).toBeNull();
    });
  });

  describe('calculateRoundReward', () => {
    it('returns base reward with no kills, no damage, and not surviving', () => {
      expect(calculateRoundReward(0, 0, false)).toBe(500);
    });

    it('adds kill bonus', () => {
      expect(calculateRoundReward(3, 0, false)).toBe(500 + 2250);
    });

    it('adds damage bonus', () => {
      expect(calculateRoundReward(0, 150, false)).toBe(500 + 750);
    });

    it('adds survival bonus', () => {
      expect(calculateRoundReward(0, 0, true)).toBe(800);
    });

    it('combines all bonuses', () => {
      expect(calculateRoundReward(2, 200, true)).toBe(500 + 1500 + 1000 + 300);
    });

    it('adds underdog bonus', () => {
      expect(calculateRoundReward(0, 0, false, true)).toBe(500 + 500);
    });
  });

  describe('calculateInterest', () => {
    it('calculates interest at default 5% rate', () => {
      expect(calculateInterest(5000)).toBe(250);
    });

    it('calculates interest at a custom rate', () => {
      expect(calculateInterest(5000, 0.1)).toBe(500);
    });

    it('floors the result to an integer', () => {
      expect(calculateInterest(333)).toBe(16);
    });

    it('caps interest at 500', () => {
      expect(calculateInterest(20000)).toBe(500);
    });
  });

  describe('getStartingLoadout', () => {
    it('returns the default starting weapons', () => {
      const loadout = getStartingLoadout();
      expect(loadout).toEqual([
        { weaponType: 'baby-missile', quantity: 99 },
        { weaponType: 'smoke-tracer', quantity: 99 },
        { weaponType: 'fire-punch', quantity: 99 },
        { weaponType: 'baseball-bat', quantity: 99 },
        { weaponType: 'grenade', quantity: 3 },
        { weaponType: 'missile', quantity: 2 },
      ]);
    });

    it('includes all starting weapon types', () => {
      const loadout = getStartingLoadout();
      expect(loadout.length).toBeGreaterThanOrEqual(2);
      const types = loadout.map((w) => w.weaponType);
      expect(types).toContain('baby-missile');
      expect(types).toContain('missile');
    });
  });
});
