import {
  calculateNapalmSpread,
  isClusterWeapon,
  spawnClusterChildren,
} from '@engine/physics/ClusterWeapon';
import { describe, expect, it } from 'vitest';
import { spawnProjectile } from '@engine/physics/ProjectileManager';
import type { WeaponDefinition } from '@shared/types/weapons';

const mirvWeapon: WeaponDefinition = {
  type: 'mirv',
  name: 'MIRV',
  category: 'cluster',
  explosionRadius: 20,
  damage: 25,
  price: 15000,
  clusterCount: 5,
  affectedByWind: true,
  affectedByGravity: true,
};

const missileWeapon: WeaponDefinition = {
  type: 'missile',
  name: 'Missile',
  category: 'projectile',
  explosionRadius: 25,
  damage: 35,
  price: 5000,
  affectedByWind: true,
  affectedByGravity: true,
};

describe('ClusterWeapon', () => {
  describe('spawnClusterChildren()', () => {
    it('should spawn correct number of children for MIRV', () => {
      const parent = spawnProjectile({ x: 100, y: 200 }, 45, 80, 'mirv', 'p1');
      const children = spawnClusterChildren(parent, mirvWeapon, 42);

      expect(children).toHaveLength(5);
    });

    it('should inherit sourcePlayerId from parent', () => {
      const parent = spawnProjectile({ x: 100, y: 200 }, 45, 80, 'mirv', 'player-1');
      const children = spawnClusterChildren(parent, mirvWeapon, 42);

      for (const child of children) {
        expect(child.sourcePlayerId).toBe('player-1');
      }
    });

    it('should spawn children at parent position', () => {
      const parent = spawnProjectile({ x: 100, y: 200 }, 45, 80, 'mirv', 'p1');
      const children = spawnClusterChildren(parent, mirvWeapon, 42);

      for (const child of children) {
        expect(child.position).toEqual(parent.position);
      }
    });

    it('should return empty array for non-cluster weapons', () => {
      const parent = spawnProjectile({ x: 100, y: 200 }, 45, 80, 'missile', 'p1');
      const children = spawnClusterChildren(parent, missileWeapon, 42);

      expect(children).toHaveLength(0);
    });

    it('should produce deterministic results for same seed', () => {
      const parent = spawnProjectile({ x: 100, y: 200 }, 45, 80, 'mirv', 'p1');
      const c1 = spawnClusterChildren(parent, mirvWeapon, 42);
      const c2 = spawnClusterChildren(parent, mirvWeapon, 42);

      for (let i = 0; i < c1.length; i++) {
        expect(c1[i]?.velocity).toEqual(c2[i]?.velocity);
      }
    });
  });

  describe('isClusterWeapon()', () => {
    it('should return true for MIRV', () => {
      expect(isClusterWeapon(mirvWeapon)).toBe(true);
    });

    it('should return false for missile', () => {
      expect(isClusterWeapon(missileWeapon)).toBe(false);
    });
  });

  describe('calculateNapalmSpread()', () => {
    it('should return correct number of impact points', () => {
      const points = calculateNapalmSpread({ x: 100, y: 200 }, 30, 5);
      expect(points).toHaveLength(5);
    });

    it('should spread points symmetrically around impact', () => {
      const points = calculateNapalmSpread({ x: 100, y: 200 }, 20, 3);
      expect(points[0]?.x).toBeCloseTo(80);
      expect(points[1]?.x).toBeCloseTo(100);
      expect(points[2]?.x).toBeCloseTo(120);
    });

    it('should keep y at impact height', () => {
      const points = calculateNapalmSpread({ x: 100, y: 200 }, 30, 5);
      for (const p of points) {
        expect(p.y).toBe(200);
      }
    });
  });
});
