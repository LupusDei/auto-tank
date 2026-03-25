import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameLoop } from '@engine/GameLoop';

describe('GameLoop', () => {
  let rafCallbacks: FrameRequestCallback[];
  let mockCAF: ReturnType<typeof vi.fn>;
  let currentTime: number;

  beforeEach(() => {
    rafCallbacks = [];
    currentTime = 0;
    const mockRAF = vi.fn((cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    mockCAF = vi.fn();
    vi.stubGlobal('requestAnimationFrame', mockRAF);
    vi.stubGlobal('cancelAnimationFrame', mockCAF);
    vi.stubGlobal('performance', { now: () => currentTime });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should not be running initially', () => {
    const loop = new GameLoop(vi.fn(), vi.fn());
    expect(loop.isRunning).toBe(false);
  });

  it('should start running when start is called', () => {
    const loop = new GameLoop(vi.fn(), vi.fn());
    const ctx = {} as CanvasRenderingContext2D;
    loop.start(ctx);
    expect(loop.isRunning).toBe(true);
    loop.stop();
  });

  it('should stop running when stop is called', () => {
    const loop = new GameLoop(vi.fn(), vi.fn());
    const ctx = {} as CanvasRenderingContext2D;
    loop.start(ctx);
    loop.stop();
    expect(loop.isRunning).toBe(false);
    expect(mockCAF).toHaveBeenCalled();
  });

  it('should not start twice if already running', () => {
    const loop = new GameLoop(vi.fn(), vi.fn());
    const ctx = {} as CanvasRenderingContext2D;
    loop.start(ctx);
    loop.start(ctx);
    expect(rafCallbacks).toHaveLength(1);
    loop.stop();
  });

  it('should call update and render on each frame', () => {
    const updateFn = vi.fn();
    const renderFn = vi.fn();
    const ctx = { canvas: { width: 800, height: 600 } } as unknown as CanvasRenderingContext2D;
    const loop = new GameLoop(updateFn, renderFn);

    loop.start(ctx);

    // Simulate a frame at 16ms
    currentTime = 16;
    const callback = rafCallbacks[0];
    expect(callback).toBeDefined();
    if (callback) {
      callback(16);
    }

    expect(updateFn).toHaveBeenCalledOnce();
    expect(renderFn).toHaveBeenCalledWith(ctx);
    loop.stop();
  });

  it('should cap delta time to 0.1 seconds', () => {
    const updateFn = vi.fn();
    const renderFn = vi.fn();
    const ctx = {} as CanvasRenderingContext2D;
    const loop = new GameLoop(updateFn, renderFn);

    loop.start(ctx);

    // Simulate a very long frame (500ms)
    currentTime = 500;
    const callback = rafCallbacks[0];
    expect(callback).toBeDefined();
    if (callback) {
      callback(500);
    }

    // Delta should be capped at 0.1, not 0.5
    const deltaArg = updateFn.mock.calls[0]?.[0] as number;
    expect(deltaArg).toBeLessThanOrEqual(0.1);
    loop.stop();
  });

  it('should not execute loop body after stop', () => {
    const updateFn = vi.fn();
    const renderFn = vi.fn();
    const ctx = {} as CanvasRenderingContext2D;
    const loop = new GameLoop(updateFn, renderFn);

    loop.start(ctx);
    loop.stop();

    // Try to call the captured callback after stop
    const callback = rafCallbacks[0];
    expect(callback).toBeDefined();
    if (callback) {
      callback(16);
    }

    expect(updateFn).not.toHaveBeenCalled();
    expect(renderFn).not.toHaveBeenCalled();
  });

  it('should handle stop when not running', () => {
    const loop = new GameLoop(vi.fn(), vi.fn());
    // Should not throw
    loop.stop();
    expect(loop.isRunning).toBe(false);
  });
});
