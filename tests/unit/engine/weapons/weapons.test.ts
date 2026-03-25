import {
  calculateExplosion,
  getAllWeapons,
  getWeaponDefinition,
  getWeaponsByCategory,
} from '@engine/weapons';
import { describe, expect, it } from 'vitest';
import { WEAPONS } from '@shared/constants/weapons';

describe('getWeaponDefinition', () => {
  it('returns the correct weapon for a known type', () => {
    const missile = getWeaponDefinition('missile');
    expect(missile).toBeDefined();
    expect(missile?.type).toBe('missile');
    expect(missile?.name).toBe('Missile');
    expect(missile?.damage).toBe(35);
  });

  it('returns undefined for an unknown type', () => {
    const result = getWeaponDefinition('plasma-cannon');
    expect(result).toBeUndefined();
  });
});

describe('getAllWeapons', () => {
  it('returns all registered weapons', () => {
    const all = getAllWeapons();
    expect(all).toHaveLength(Object.keys(WEAPONS).length);
  });
});

describe('getWeaponsByCategory', () => {
  it('filters weapons by category', () => {
    const cluster = getWeaponsByCategory('cluster');
    expect(cluster.length).toBeGreaterThan(0);
    for (const w of cluster) {
      expect(w.category).toBe('cluster');
    }
  });

  it('returns empty array for unknown category', () => {
    const result = getWeaponsByCategory('nonexistent');
    expect(result).toEqual([]);
  });
});

describe('calculateExplosion', () => {
  it('produces correct radius, damage, and crater depth', () => {
    const weapon = getWeaponDefinition('nuke');
    expect(weapon).toBeDefined();
    if (!weapon) return;
    const explosion = calculateExplosion({ x: 100, y: 200 }, weapon);

    expect(explosion.center).toEqual({ x: 100, y: 200 });
    expect(explosion.radius).toBe(weapon.explosionRadius);
    expect(explosion.damage).toBe(weapon.damage);
    expect(explosion.craterDepth).toBe(Math.round(weapon.explosionRadius * 0.6));
  });
});
