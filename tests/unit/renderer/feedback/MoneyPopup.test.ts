import { createMoneyPopup, getPopupOpacity, isPopupVisible } from '@renderer/feedback/MoneyPopup';
import { describe, expect, it } from 'vitest';

describe('MoneyPopup', () => {
  it('should create popup', () => {
    const p = createMoneyPopup(500, { x: 100, y: 200 });
    expect(p.amount).toBe(500);
    expect(p.isBonus).toBe(false);
  });

  it('should create bonus popup', () => {
    const p = createMoneyPopup(2000, { x: 100, y: 200 }, true);
    expect(p.isBonus).toBe(true);
  });

  it('should be visible initially', () => {
    expect(isPopupVisible(createMoneyPopup(100, { x: 0, y: 0 }))).toBe(true);
  });

  it('should have full opacity initially', () => {
    expect(getPopupOpacity(createMoneyPopup(100, { x: 0, y: 0 }))).toBeCloseTo(1, 0);
  });
});
