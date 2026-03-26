import {
  applyDamageToShield,
  createShield,
  getShieldPercentage,
  isShieldActive,
} from '@engine/defense/ShieldSystem';
import { describe, expect, it } from 'vitest';

describe('ShieldSystem', () => {
  it('should create light shield with 50 capacity', () => {
    const shield = createShield('light');
    expect(shield.type).toBe('light');
    expect(shield.remaining).toBe(50);
    expect(shield.absorption).toBe(0.5);
  });

  it('should create heavy shield with 100 capacity', () => {
    const shield = createShield('heavy');
    expect(shield.remaining).toBe(100);
    expect(shield.absorption).toBe(0.8);
  });

  it('should absorb damage with light shield', () => {
    const shield = createShield('light');
    const result = applyDamageToShield(shield, 40);
    // Absorbs 40 * 0.5 = 20 from shield, remaining damage = 40 - 20 = 20
    expect(result.remainingDamage).toBe(20);
    expect(result.shield?.remaining).toBe(30);
  });

  it('should break shield when capacity exhausted', () => {
    const shield = createShield('light');
    const result = applyDamageToShield(shield, 200);
    expect(result.shield).toBeNull();
    expect(result.remainingDamage).toBeGreaterThan(0);
  });

  it('should check if shield is active', () => {
    expect(isShieldActive(createShield('light'))).toBe(true);
    expect(isShieldActive(null)).toBe(false);
  });

  it('should calculate shield percentage', () => {
    const shield = createShield('heavy');
    expect(getShieldPercentage(shield)).toBe(100);
    const damaged = applyDamageToShield(shield, 50);
    if (damaged.shield) {
      expect(getShieldPercentage(damaged.shield)).toBeLessThan(100);
    }
  });
});
