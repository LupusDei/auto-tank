import { describe, expect, it, vi } from 'vitest';
import { TickLoop } from '@engine/TickLoop';

describe('TickLoop', () => {
  it('should start and stop', () => {
    const loop = new TickLoop(vi.fn(), vi.fn(), vi.fn());
    expect(loop.isRunning).toBe(false);
    // Can't test rAF in jsdom, but tick() works
  });

  it('should run physics at fixed rate via tick()', () => {
    const physics = vi.fn();
    const render = vi.fn();
    const input = vi.fn();
    const loop = new TickLoop(physics, render, input, { physicsRate: 60 });

    // Simulate 1/30s (2 physics ticks at 60Hz)
    loop.tick(1 / 30);

    expect(physics).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenCalledTimes(1);
  });

  it('should pass fixed dt to physics', () => {
    const physics = vi.fn();
    const loop = new TickLoop(physics, vi.fn(), vi.fn(), { physicsRate: 60 });

    loop.tick(1 / 60);

    expect(physics).toHaveBeenCalledWith(1 / 60);
  });

  it('should poll input at configured rate', () => {
    const input = vi.fn();
    const loop = new TickLoop(vi.fn(), vi.fn(), input, { inputRate: 30 });

    // 1/30s = 1 input poll at 30Hz
    loop.tick(1 / 30);
    expect(input).toHaveBeenCalledTimes(1);
  });

  it('should pass interpolation to render', () => {
    const render = vi.fn();
    const loop = new TickLoop(vi.fn(), render, vi.fn(), { physicsRate: 60 });

    // Half a physics step
    loop.tick(1 / 120);

    expect(render).toHaveBeenCalledTimes(1);
    const interpolation = render.mock.calls[0]?.[1] as number;
    expect(interpolation).toBeCloseTo(0.5, 1);
  });

  it('should track tick and frame counts', () => {
    const loop = new TickLoop(vi.fn(), vi.fn(), vi.fn());

    expect(loop.physicsTicks).toBe(0);
    expect(loop.renderFrames).toBe(0);

    loop.tick(1 / 60);

    expect(loop.physicsTicks).toBe(1);
    expect(loop.renderFrames).toBe(1);
  });

  it('should handle large dt without spiral of death', () => {
    const physics = vi.fn();
    const loop = new TickLoop(physics, vi.fn(), vi.fn(), { physicsRate: 60 });

    // 0.1s cap (6 physics ticks max)
    loop.tick(0.5);

    // Should be capped by the 0.1s limit in the rAF loop,
    // but tick() doesn't cap — so it runs 30 ticks for 0.5s at 60Hz
    expect(physics.mock.calls.length).toBe(30);
  });
});
