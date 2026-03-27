import {
  createCountdown,
  getCountdownValue,
  renderCountdown,
} from '@renderer/feedback/RoundCountdown';
import { describe, expect, it, vi } from 'vitest';

describe('RoundCountdown', () => {
  it('should create countdown with default interval', () => {
    const state = createCountdown();
    expect(state.count).toBe(3);
    expect(state.interval).toBe(0.8);
  });

  it('should return correct countdown values over time', () => {
    expect(getCountdownValue(0, 0.8)).toBe('3');
    expect(getCountdownValue(0.5, 0.8)).toBe('3');
    expect(getCountdownValue(0.81, 0.8)).toBe('2');
    expect(getCountdownValue(1.61, 0.8)).toBe('1');
    expect(getCountdownValue(2.41, 0.8)).toBe('GO!');
  });

  it('should return empty string after all counts', () => {
    expect(getCountdownValue(3.5, 0.8)).toBe('');
  });

  it('should render without throwing', () => {
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D;

    expect(() => renderCountdown(ctx, '3', 800, 600, 0.5)).not.toThrow();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('should not render when value is empty', () => {
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D;

    renderCountdown(ctx, '', 800, 600, 0);
    expect(ctx.fillText).not.toHaveBeenCalled();
  });
});
