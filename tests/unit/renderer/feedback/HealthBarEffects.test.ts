import {
  createSmoothHealthBar,
  setShieldAmount,
  setTargetHealth,
  updateSmoothHealthBar,
} from '@renderer/feedback/HealthBarEffects';
import { describe, expect, it } from 'vitest';

describe('HealthBarEffects', () => {
  it('should create health bar at full health', () => {
    const bar = createSmoothHealthBar(100, 100);
    expect(bar.displayHealth).toBe(100);
    expect(bar.criticalFlashing).toBe(false);
  });

  it('should lerp toward target', () => {
    let bar = createSmoothHealthBar(100, 100);
    bar = setTargetHealth(bar, 50);
    bar = updateSmoothHealthBar(bar, 0.5);
    expect(bar.displayHealth).toBeLessThan(100);
    expect(bar.displayHealth).toBeGreaterThan(50);
  });

  it('should flash at critical health', () => {
    let bar = createSmoothHealthBar(15, 100);
    bar = setTargetHealth(bar, 15);
    bar = updateSmoothHealthBar(bar, 0.01);
    expect(bar.criticalFlashing).toBe(true);
  });

  it('should set shield amount', () => {
    const bar = setShieldAmount(createSmoothHealthBar(100, 100), 50);
    expect(bar.shieldAmount).toBe(50);
  });
});
