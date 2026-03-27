import { describe, expect, it, vi } from 'vitest';
import { type RenderLayer, RenderPipeline } from '@renderer/RenderPipeline';
import type { GameState } from '@shared/types/game';

function createMockCanvas(): HTMLCanvasElement {
  const ctx = {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  };
  return {
    getContext: vi.fn(() => ctx),
  } as unknown as HTMLCanvasElement;
}

function createGameState(): GameState {
  return {
    phase: 'playing',
    players: [],
    terrain: null,
    currentPlayerIndex: 0,
    currentRound: 1,
    wind: 0,
    config: {
      maxRounds: 3,
      turnTimeSeconds: 30,
      startingMoney: 1000,
      windStrength: 10,
      gravity: 9.81,
      suddenDeathEnabled: false,
      suddenDeathTurns: 20,
      wallMode: 'open' as const,
    },
    turnTimer: 30,
  };
}

describe('RenderPipeline', () => {
  it('should initialize with canvas context', () => {
    const canvas = createMockCanvas();
    const pipeline = new RenderPipeline({ canvas, width: 800, height: 600 });
    expect(pipeline.width).toBe(800);
    expect(pipeline.height).toBe(600);
  });

  it('should throw if canvas context unavailable', () => {
    const canvas = { getContext: vi.fn(() => null) } as unknown as HTMLCanvasElement;
    expect(() => new RenderPipeline({ canvas, width: 800, height: 600 })).toThrow();
  });

  it('should add and count layers', () => {
    const canvas = createMockCanvas();
    const pipeline = new RenderPipeline({ canvas, width: 800, height: 600 });

    expect(pipeline.layerCount).toBe(0);

    const layer: RenderLayer = { name: 'test', render: vi.fn() };
    pipeline.addLayer(layer);

    expect(pipeline.layerCount).toBe(1);
  });

  it('should render layers in order', () => {
    const canvas = createMockCanvas();
    const pipeline = new RenderPipeline({ canvas, width: 800, height: 600 });
    pipeline.updateState(createGameState());

    const callOrder: string[] = [];
    const layer1: RenderLayer = { name: 'sky', render: vi.fn(() => callOrder.push('sky')) };
    const layer2: RenderLayer = { name: 'terrain', render: vi.fn(() => callOrder.push('terrain')) };
    const layer3: RenderLayer = { name: 'tanks', render: vi.fn(() => callOrder.push('tanks')) };

    pipeline.addLayer(layer1);
    pipeline.addLayer(layer2);
    pipeline.addLayer(layer3);

    pipeline.renderFrame(1 / 60);

    expect(callOrder).toEqual(['sky', 'terrain', 'tanks']);
  });

  it('should not render when no game state set', () => {
    const canvas = createMockCanvas();
    const pipeline = new RenderPipeline({ canvas, width: 800, height: 600 });
    const layer: RenderLayer = { name: 'test', render: vi.fn() };
    pipeline.addLayer(layer);

    pipeline.renderFrame(1 / 60);

    expect(layer.render).not.toHaveBeenCalled();
  });

  it('should clear canvas before rendering', () => {
    const canvas = createMockCanvas();
    const pipeline = new RenderPipeline({ canvas, width: 800, height: 600 });
    pipeline.updateState(createGameState());

    pipeline.renderFrame(1 / 60);

    const ctx = pipeline.getContext();
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });

  it('should save/restore context around each layer', () => {
    const canvas = createMockCanvas();
    const pipeline = new RenderPipeline({ canvas, width: 800, height: 600 });
    pipeline.updateState(createGameState());

    const layer: RenderLayer = { name: 'test', render: vi.fn() };
    pipeline.addLayer(layer);

    pipeline.renderFrame(1 / 60);

    const ctx = pipeline.getContext();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('should manage effects lifecycle', () => {
    const canvas = createMockCanvas();
    const pipeline = new RenderPipeline({ canvas, width: 800, height: 600 });
    pipeline.updateState(createGameState());

    const effect = {
      id: 'e1',
      startTime: performance.now() - 1000,
      duration: 500,
      render: vi.fn(),
      isComplete: vi.fn(() => true),
    };

    pipeline.addEffect(effect);
    expect(pipeline.effectCount).toBe(1);

    pipeline.renderFrame(1 / 60);

    // Effect was complete, should be removed
    expect(pipeline.effectCount).toBe(0);
  });

  it('should render active effects', () => {
    const canvas = createMockCanvas();
    const pipeline = new RenderPipeline({ canvas, width: 800, height: 600 });
    pipeline.updateState(createGameState());

    const effect = {
      id: 'e1',
      startTime: performance.now(),
      duration: 1000,
      render: vi.fn(),
      isComplete: vi.fn(() => false),
    };

    pipeline.addEffect(effect);
    pipeline.renderFrame(1 / 60);

    expect(effect.render).toHaveBeenCalled();
    expect(pipeline.effectCount).toBe(1);
  });
});
