import { describe, expect, it } from 'vitest';
import {
  getMaxPurchase,
  getTierColor,
  getWeaponsByTier,
  getWeaponTier,
  NEW_WEAPONS,
} from '@engine/weapons/NewWeapons';

describe('NewWeapons', () => {
  it('should have at least 8 weapons', () => {
    expect(NEW_WEAPONS.length).toBeGreaterThanOrEqual(8);
  });

  it('should have all tiers represented', () => {
    const tiers = new Set(NEW_WEAPONS.map((w) => w.tier));
    expect(tiers).toContain('free');
    expect(tiers).toContain('common');
    expect(tiers).toContain('rare');
    expect(tiers).toContain('legendary');
  });

  it('should get weapons by tier', () => {
    const legendary = getWeaponsByTier('legendary');
    expect(legendary.length).toBeGreaterThan(0);
    for (const w of legendary) expect(w.tier).toBe('legendary');
  });

  it('should limit legendary purchases to 1', () => {
    expect(getMaxPurchase('legendary')).toBe(1);
  });

  it('should allow more common purchases', () => {
    expect(getMaxPurchase('common')).toBeGreaterThan(getMaxPurchase('legendary'));
  });

  it('should return tier color', () => {
    expect(getTierColor('legendary')).toBe('#ffaa00');
    expect(getTierColor('free')).toBe('#888888');
  });

  it('should return tier info for weapon', () => {
    const nuke = NEW_WEAPONS.find((w) => w.type === 'nuke');
    expect(nuke).toBeDefined();
    if (nuke) {
      const tier = getWeaponTier(nuke);
      expect(tier.maxPurchase).toBe(1);
    }
  });
});
