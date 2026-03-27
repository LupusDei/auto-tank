import {
  createKillConfirmation,
  getKillConfirmationTimescale,
  renderKillConfirmation,
} from '@renderer/feedback/KillConfirmation';
import { describe, expect, it, vi } from 'vitest';

describe('KillConfirmation', () => {
  it('should create with killer and victim info', () => {
    const state = createKillConfirmation('Alice', 'Bob', { x: 100, y: 200 });
    expect(state.killerName).toBe('Alice');
    expect(state.victimName).toBe('Bob');
    expect(state.position.x).toBe(100);
    expect(state.position.y).toBe(200);
    expect(state.duration).toBe(2);
  });

  it('should return slow-mo timescale in first 0.5s', () => {
    expect(getKillConfirmationTimescale(0, 2)).toBeCloseTo(0.2);
    expect(getKillConfirmationTimescale(0.25, 2)).toBeCloseTo(0.2);
    expect(getKillConfirmationTimescale(0.49, 2)).toBeCloseTo(0.2);
  });

  it('should ramp timescale back to 1.0 from 1.5s to 2.0s', () => {
    expect(getKillConfirmationTimescale(1.75, 2)).toBeGreaterThan(0.5);
    expect(getKillConfirmationTimescale(2.0, 2)).toBeCloseTo(1.0);
  });

  it('should return 1.0 timescale after duration', () => {
    expect(getKillConfirmationTimescale(3.0, 2)).toBe(1.0);
  });

  it('should render without throwing', () => {
    const state = createKillConfirmation('Alice', 'Bob', { x: 400, y: 300 });
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

    expect(() => renderKillConfirmation(ctx, state, 800, 600, 1.0)).not.toThrow();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('should handle zero elapsed gracefully', () => {
    const scale = getKillConfirmationTimescale(0, 2);
    expect(scale).toBe(0.2);
  });
});
