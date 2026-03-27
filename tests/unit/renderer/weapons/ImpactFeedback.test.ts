import {
  createDamageNumber,
  getDamageNumberOpacity,
  isDamageNumberVisible,
  isOverkill,
} from '@renderer/weapons/ImpactFeedback';
import { describe, expect, it } from 'vitest';

describe('ImpactFeedback', () => {
  it('should create damage number at position', () => {
    const dmg = createDamageNumber(25, { x: 100, y: 200 });
    expect(dmg.value).toBe(25);
    expect(dmg.isCritical).toBe(false);
  });

  it('should create critical hit with larger font', () => {
    const dmg = createDamageNumber(80, { x: 100, y: 200 }, true);
    expect(dmg.isCritical).toBe(true);
    expect(dmg.fontSize).toBe(36);
    expect(dmg.color).toBe('#ffdd00');
  });

  it('should be visible immediately', () => {
    expect(isDamageNumberVisible(createDamageNumber(10, { x: 0, y: 0 }))).toBe(true);
  });

  it('should have full opacity initially', () => {
    expect(getDamageNumberOpacity(createDamageNumber(10, { x: 0, y: 0 }))).toBeCloseTo(1, 0);
  });

  it('should detect overkill', () => {
    expect(isOverkill(100, 20)).toBe(true);
    expect(isOverkill(30, 50)).toBe(false);
  });
});
