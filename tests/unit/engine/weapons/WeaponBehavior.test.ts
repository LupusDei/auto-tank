import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearBehaviors,
  getBehavior,
  hasBehavior,
  registerBehavior,
} from '@engine/weapons/WeaponBehavior';
import type { Projectile } from '@shared/types/projectile';
import type { WeaponBehavior } from '@engine/weapons/WeaponBehavior';

const stubBehavior: WeaponBehavior = {
  weaponType: 'test-weapon',
  update(projectile: Projectile) {
    return { projectile, shouldExplode: false };
  },
};

describe('WeaponBehavior registry', () => {
  beforeEach(() => {
    clearBehaviors();
  });

  it('hasBehavior returns false for unregistered weapon', () => {
    expect(hasBehavior('nonexistent')).toBe(false);
  });

  it('getBehavior returns undefined for unregistered weapon', () => {
    expect(getBehavior('nonexistent')).toBeUndefined();
  });

  it('registers and retrieves a behavior', () => {
    registerBehavior(stubBehavior);
    expect(hasBehavior('test-weapon')).toBe(true);
    expect(getBehavior('test-weapon')).toBe(stubBehavior);
  });

  it('clearBehaviors removes all registered behaviors', () => {
    registerBehavior(stubBehavior);
    clearBehaviors();
    expect(hasBehavior('test-weapon')).toBe(false);
  });
});
