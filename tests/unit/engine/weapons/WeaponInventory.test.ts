import {
  addAmmo,
  consumeAmmo,
  getAmmoCount,
  getAvailableWeaponTypes,
  getDefaultWeapon,
  hasAmmo,
} from '@engine/weapons/WeaponInventory';
import { describe, expect, it } from 'vitest';
import type { Weapon, WeaponDefinition } from '@shared/types/weapons';

const missileDef: WeaponDefinition = {
  type: 'missile',
  name: 'Missile',
  category: 'projectile',
  explosionRadius: 25,
  damage: 35,
  price: 300,
  affectedByWind: true,
  affectedByGravity: true,
};

const nukeDef: WeaponDefinition = {
  type: 'nuke',
  name: 'Nuke',
  category: 'projectile',
  explosionRadius: 80,
  damage: 100,
  price: 5000,
  affectedByWind: false,
  affectedByGravity: true,
};

const inventory: Weapon[] = [
  { definition: missileDef, quantity: 3 },
  { definition: nukeDef, quantity: 1 },
];

describe('WeaponInventory', () => {
  it('should check if ammo exists', () => {
    expect(hasAmmo(inventory, 'missile')).toBe(true);
    expect(hasAmmo(inventory, 'baby-missile')).toBe(false);
  });

  it('should get ammo count', () => {
    expect(getAmmoCount(inventory, 'missile')).toBe(3);
    expect(getAmmoCount(inventory, 'baby-missile')).toBe(0);
  });

  it('should consume ammo', () => {
    const after = consumeAmmo(inventory, 'missile');
    expect(getAmmoCount(after, 'missile')).toBe(2);
  });

  it('should not go below 0', () => {
    let inv = consumeAmmo(inventory, 'nuke');
    inv = consumeAmmo(inv, 'nuke');
    expect(getAmmoCount(inv, 'nuke')).toBe(0);
  });

  it('should add ammo to existing weapon', () => {
    const after = addAmmo(inventory, 'missile', 5, missileDef);
    expect(getAmmoCount(after, 'missile')).toBe(8);
  });

  it('should add new weapon type', () => {
    const babyDef: WeaponDefinition = {
      ...missileDef,
      type: 'baby-missile',
      name: 'Baby Missile',
      price: 0,
    };
    const after = addAmmo(inventory, 'baby-missile', 10, babyDef);
    expect(getAmmoCount(after, 'baby-missile')).toBe(10);
    expect(after).toHaveLength(3);
  });

  it('should list available weapon types', () => {
    const types = getAvailableWeaponTypes(inventory);
    expect(types).toContain('missile');
    expect(types).toContain('nuke');
  });

  it('should get default weapon', () => {
    expect(getDefaultWeapon(inventory)).toBe('missile');
    expect(getDefaultWeapon([])).toBeNull();
  });
});
