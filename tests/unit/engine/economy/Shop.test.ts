import { buyWeapon, getInventoryValue, processPurchases } from '@engine/economy/Shop';
import { describe, expect, it } from 'vitest';
import type { Player } from '@shared/types/entities';
import type { WeaponDefinition } from '@shared/types/weapons';

const missileDef: WeaponDefinition = {
  type: 'missile',
  name: 'Missile',
  category: 'projectile',
  explosionRadius: 25,
  damage: 35,
  price: 5000,
  affectedByWind: true,
  affectedByGravity: true,
};

const nukeDef: WeaponDefinition = {
  type: 'nuke',
  name: 'Nuke',
  category: 'projectile',
  explosionRadius: 80,
  damage: 100,
  price: 50000,
  affectedByWind: false,
  affectedByGravity: true,
};

function createPlayer(money: number): Player {
  return {
    id: 'p1',
    name: 'Alice',
    color: 'red',
    tanks: [],
    money,
    inventory: [],
    kills: 0,
    deaths: 0,
    isAI: false,
  };
}

describe('Shop', () => {
  describe('buyWeapon()', () => {
    it('should deduct money and add to inventory', () => {
      const player = createPlayer(10000);
      const result = buyWeapon(player, missileDef);

      expect(result).not.toBeNull();
      expect(result?.money).toBe(5000);
      expect(result?.inventory).toHaveLength(1);
    });

    it('should return null when cannot afford', () => {
      const player = createPlayer(1000);
      expect(buyWeapon(player, missileDef)).toBeNull();
    });

    it('should buy multiple quantity', () => {
      const player = createPlayer(20000);
      const result = buyWeapon(player, missileDef, 3);

      expect(result?.money).toBe(5000);
    });

    it('should add to existing weapon count', () => {
      let player = createPlayer(20000);
      const buy1 = buyWeapon(player, missileDef);
      expect(buy1).not.toBeNull();
      if (!buy1) return;
      player = buy1;
      const buy2 = buyWeapon(player, missileDef);
      expect(buy2).not.toBeNull();
      if (!buy2) return;
      player = buy2;

      const missileEntry = player.inventory.find((w) => w.definition.type === 'missile');
      expect(missileEntry?.quantity).toBe(2);
    });
  });

  describe('processPurchases()', () => {
    it('should process multiple purchases', () => {
      const player = createPlayer(60000);
      const result = processPurchases(player, [
        { playerId: 'p1', weaponType: missileDef, quantity: 2 },
        { playerId: 'p1', weaponType: nukeDef, quantity: 1 },
      ]);

      expect(result.money).toBe(0); // 60000 - 10000 - 50000
    });

    it('should stop at first unaffordable purchase', () => {
      const player = createPlayer(6000);
      const result = processPurchases(player, [
        { playerId: 'p1', weaponType: missileDef, quantity: 1 },
        { playerId: 'p1', weaponType: nukeDef, quantity: 1 }, // can't afford
      ]);

      expect(result.money).toBe(1000);
      expect(result.inventory).toHaveLength(1);
    });
  });

  describe('getInventoryValue()', () => {
    it('should calculate total value', () => {
      const inv = [
        { definition: missileDef, quantity: 3 },
        { definition: nukeDef, quantity: 1 },
      ];
      expect(getInventoryValue(inv)).toBe(15000 + 50000);
    });

    it('should return 0 for empty inventory', () => {
      expect(getInventoryValue([])).toBe(0);
    });
  });
});
