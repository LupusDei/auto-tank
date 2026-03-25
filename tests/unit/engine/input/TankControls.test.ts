import { adjustAngle, adjustPower, cycleWeapon } from '@engine/input/TankControls';
import { describe, expect, it } from 'vitest';
import type { WeaponType } from '@shared/types/weapons';

describe('TankControls', () => {
  describe('adjustAngle()', () => {
    it('should increase angle', () => {
      expect(adjustAngle(45, 5)).toBe(50);
    });

    it('should decrease angle', () => {
      expect(adjustAngle(45, -5)).toBe(40);
    });

    it('should clamp to max angle', () => {
      expect(adjustAngle(178, 5)).toBe(180);
    });

    it('should clamp to min angle', () => {
      expect(adjustAngle(2, -5)).toBe(0);
    });

    it('should handle exact boundary values', () => {
      expect(adjustAngle(0, 0)).toBe(0);
      expect(adjustAngle(180, 0)).toBe(180);
    });
  });

  describe('adjustPower()', () => {
    it('should increase power', () => {
      expect(adjustPower(50, 5)).toBe(55);
    });

    it('should decrease power', () => {
      expect(adjustPower(50, -5)).toBe(45);
    });

    it('should clamp to max power', () => {
      expect(adjustPower(98, 5)).toBe(100);
    });

    it('should clamp to min power', () => {
      expect(adjustPower(2, -5)).toBe(0);
    });
  });

  describe('cycleWeapon()', () => {
    const weapons: WeaponType[] = ['baby-missile', 'missile', 'nuke'];

    it('should cycle to next weapon', () => {
      expect(cycleWeapon(weapons, 'baby-missile', 1)).toBe('missile');
    });

    it('should wrap around forward', () => {
      expect(cycleWeapon(weapons, 'nuke', 1)).toBe('baby-missile');
    });

    it('should cycle backward', () => {
      expect(cycleWeapon(weapons, 'baby-missile', -1)).toBe('nuke');
    });

    it('should return current when single weapon', () => {
      expect(cycleWeapon(['missile'], 'missile', 1)).toBe('missile');
    });

    it('should return first when current not found', () => {
      expect(cycleWeapon(weapons, 'holy-hand-grenade', 1)).toBe('baby-missile');
    });

    it('should return current when empty array', () => {
      expect(cycleWeapon([], 'missile', 1)).toBe('missile');
    });
  });
});
