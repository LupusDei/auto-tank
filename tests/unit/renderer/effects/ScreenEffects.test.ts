import {
  createShake,
  getKillCamFactor,
  getRoundTransitionFade,
  getShakeOffset,
  isShakeComplete,
  updateShake,
} from '@renderer/effects/ScreenEffects';
import { describe, expect, it } from 'vitest';

describe('ScreenEffects', () => {
  it('should create shake', () => {
    const shake = createShake(10, 500);
    expect(shake.intensity).toBe(10);
    expect(isShakeComplete(shake)).toBe(false);
  });

  it('should decay shake over time', () => {
    let shake = createShake(10, 500);
    shake = updateShake(shake, 1);
    expect(isShakeComplete(shake)).toBe(true);
    expect(getShakeOffset(shake)).toEqual({ x: 0, y: 0 });
  });

  it('should return offset during shake', () => {
    const shake = createShake(20, 1000);
    const offset = getShakeOffset(shake);
    // At t=0, decay=1, offset could be up to ±20
    expect(Math.abs(offset.x)).toBeLessThanOrEqual(20);
  });

  it('should slow down for kill cam', () => {
    expect(getKillCamFactor(0, 1000)).toBe(0.2);
    expect(getKillCamFactor(1000, 1000)).toBe(1);
  });

  it('should fade for round transition', () => {
    expect(getRoundTransitionFade(0, 1000)).toBe(0);
    expect(getRoundTransitionFade(500, 1000)).toBe(1);
    expect(getRoundTransitionFade(1000, 1000)).toBe(0);
  });
});
