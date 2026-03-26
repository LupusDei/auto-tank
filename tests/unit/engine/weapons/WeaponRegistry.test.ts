import { describe, expect, it } from 'vitest';
import {
  getAffordableWeapons,
  getAllWeapons,
  getWeapon,
  getWeaponsByCategory,
  getWeaponsSortedByPrice,
} from '@engine/weapons/WeaponRegistry';

describe('WeaponRegistry', () => {
  it('should get weapon by type', () => {
    const weapon = getWeapon('missile');
    expect(weapon).toBeDefined();
    expect(weapon?.name).toBe('Missile');
  });

  it('should return undefined for unknown type', () => {
    expect(getWeapon('unknown-weapon' as 'missile')).toBeUndefined();
  });

  it('should get all weapons', () => {
    const weapons = getAllWeapons();
    expect(weapons.length).toBeGreaterThan(0);
  });

  it('should filter by category', () => {
    const clusters = getWeaponsByCategory('cluster');
    for (const w of clusters) {
      expect(w.category).toBe('cluster');
    }
    expect(clusters.length).toBeGreaterThan(0);
  });

  it('should filter affordable weapons', () => {
    const cheap = getAffordableWeapons(5000);
    for (const w of cheap) {
      expect(w.price).toBeLessThanOrEqual(5000);
    }
  });

  it('should sort by price', () => {
    const sorted = getWeaponsSortedByPrice();
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (prev && curr) {
        expect(curr.price).toBeGreaterThanOrEqual(prev.price);
      }
    }
  });
});
