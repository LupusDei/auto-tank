import {
  createTimerConfig,
  getRemainingTime,
  getTimerProgress,
  isTurnExpired,
  shouldShowWarning,
} from '@engine/gamemode/RoundTimeLimit';
import { describe, expect, it } from 'vitest';

describe('RoundTimeLimit', () => {
  it('should create timer config', () => {
    const cfg = createTimerConfig(45);
    expect(cfg.maxTurnTime).toBe(45);
    expect(cfg.timeoutAction).toBe('skip');
  });

  it('should detect expired turn', () => {
    expect(isTurnExpired(31, 30)).toBe(true);
    expect(isTurnExpired(20, 30)).toBe(false);
  });

  it('should show warning near end', () => {
    expect(shouldShowWarning(4, 5)).toBe(true);
    expect(shouldShowWarning(10, 5)).toBe(false);
    expect(shouldShowWarning(0, 5)).toBe(false);
  });

  it('should calculate remaining time', () => {
    expect(getRemainingTime(20, 30)).toBe(10);
    expect(getRemainingTime(35, 30)).toBe(0);
  });

  it('should calculate progress', () => {
    expect(getTimerProgress(15, 30)).toBeCloseTo(0.5);
    expect(getTimerProgress(30, 30)).toBe(1);
  });
});
