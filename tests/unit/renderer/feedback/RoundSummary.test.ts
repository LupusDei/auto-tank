import { describe, expect, it } from 'vitest';
import { calculateIncomeBreakdown } from '@renderer/feedback/RoundSummary';

describe('RoundSummary', () => {
  it('should calculate breakdown correctly', () => {
    const bd = calculateIncomeBreakdown('Player 1', 50, 1, true, 5000);
    expect(bd.basePay).toBe(1000);
    expect(bd.killBonus).toBe(2000);
    expect(bd.damageBonus).toBe(50);
    expect(bd.survivalBonus).toBe(500);
    expect(bd.interest).toBe(500);
    expect(bd.total).toBe(4050);
  });

  it('should give no survival bonus on death', () => {
    const bd = calculateIncomeBreakdown('Player 2', 0, 0, false, 0);
    expect(bd.survivalBonus).toBe(0);
    expect(bd.total).toBe(1000);
  });
});
