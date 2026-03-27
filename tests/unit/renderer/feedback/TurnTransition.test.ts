import {
  createTurnTransition,
  getTurnTransitionPhase,
  renderTurnTransition,
} from '@renderer/feedback/TurnTransition';
import { describe, expect, it, vi } from 'vitest';

describe('TurnTransition', () => {
  it('should create transition with player info', () => {
    const state = createTurnTransition('Alice', '#ff0000');
    expect(state.playerName).toBe('Alice');
    expect(state.playerColor).toBe('#ff0000');
    expect(state.duration).toBe(1.5);
    expect(state.phase).toBe('slide-in');
  });

  it('should return slide-in phase for first 0.3s', () => {
    expect(getTurnTransitionPhase(0, 1.5)).toBe('slide-in');
    expect(getTurnTransitionPhase(0.2, 1.5)).toBe('slide-in');
  });

  it('should return hold phase between 0.3s and 1.1s', () => {
    expect(getTurnTransitionPhase(0.3, 1.5)).toBe('hold');
    expect(getTurnTransitionPhase(0.8, 1.5)).toBe('hold');
    expect(getTurnTransitionPhase(1.0, 1.5)).toBe('hold');
  });

  it('should return slide-out phase between 1.1s and 1.5s', () => {
    expect(getTurnTransitionPhase(1.1, 1.5)).toBe('slide-out');
    expect(getTurnTransitionPhase(1.3, 1.5)).toBe('slide-out');
  });

  it('should return done after duration', () => {
    expect(getTurnTransitionPhase(1.5, 1.5)).toBe('done');
    expect(getTurnTransitionPhase(2.0, 1.5)).toBe('done');
  });

  it('should render without throwing', () => {
    const state = createTurnTransition('Bob', '#00ff00');
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

    expect(() => renderTurnTransition(ctx, state, 800, 600, 0.5)).not.toThrow();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });
});
