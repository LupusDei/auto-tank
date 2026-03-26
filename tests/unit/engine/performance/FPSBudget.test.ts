import { describe, expect, it, vi } from 'vitest';
import { FPSBudget } from '@engine/performance/FPSBudget';

describe('FPSBudget', () => {
  it('should start at 0 fps', () => {
    expect(new FPSBudget().fps).toBe(0);
  });

  it('should calculate FPS from recorded frames', () => {
    const budget = new FPSBudget(60);
    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(16.67)
      .mockReturnValueOnce(33.34);
    budget.recordFrame();
    budget.recordFrame();
    budget.recordFrame();
    expect(budget.fps).toBeCloseTo(60, -1);
  });

  it('should detect below budget', () => {
    const budget = new FPSBudget(60);
    // Simulate low FPS
    vi.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValueOnce(50); // 20 FPS
    budget.recordFrame();
    budget.recordFrame();
    expect(budget.isBelowBudget).toBe(true);
  });

  it('should suggest quality reduction', () => {
    const budget = new FPSBudget(60);
    vi.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValueOnce(100); // 10 FPS
    budget.recordFrame();
    budget.recordFrame();
    expect(budget.qualityLevel).toBeGreaterThan(0);
  });
});
