import { applyCameraTransform, createCamera, lerpCamera } from '@renderer/Camera';
import { describe, expect, it, vi } from 'vitest';
import { type RenderLayer, RenderPipeline } from '@renderer/RenderPipeline';
import { createExplosionEffect } from '@renderer/effects/ExplosionRenderer';
import type { GameState } from '@shared/types/game';

function createMockCanvas(): HTMLCanvasElement {
  const ctx = {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
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
    wind: 5,
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

describe('Render Pipeline Integration', () => {
  it('should render full pipeline: sky → terrain → entities → effects', () => {
    const canvas = createMockCanvas();
    const pipeline = new RenderPipeline({ canvas, width: 800, height: 600 });
    pipeline.updateState(createGameState());

    const renderOrder: string[] = [];
    const skyLayer: RenderLayer = { name: 'sky', render: vi.fn(() => renderOrder.push('sky')) };
    const terrainLayer: RenderLayer = {
      name: 'terrain',
      render: vi.fn(() => renderOrder.push('terrain')),
    };
    const entityLayer: RenderLayer = {
      name: 'entities',
      render: vi.fn(() => renderOrder.push('entities')),
    };

    pipeline.addLayer(skyLayer);
    pipeline.addLayer(terrainLayer);
    pipeline.addLayer(entityLayer);

    // Add an active explosion effect
    const explosion = createExplosionEffect({
      position: { x: 200, y: 300 },
      radius: 40,
      duration: 1000,
    });
    pipeline.addEffect(explosion);

    pipeline.renderFrame(1 / 60);

    // Verify draw order
    expect(renderOrder).toEqual(['sky', 'terrain', 'entities']);

    // Verify canvas was cleared
    const ctx = pipeline.getContext();
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);

    // Effect should still be active
    expect(pipeline.effectCount).toBe(1);
  });

  it('should integrate camera transforms with layers', () => {
    const canvas = createMockCanvas();
    const pipeline = new RenderPipeline({ canvas, width: 800, height: 600 });
    pipeline.updateState(createGameState());

    let camera = createCamera(800, 600);
    camera = lerpCamera(camera, { x: 500, y: 400 }, 0.5);

    const cameraLayer: RenderLayer = {
      name: 'camera',
      render(ctx): void {
        applyCameraTransform(ctx, camera, 800, 600);
      },
    };

    pipeline.addLayer(cameraLayer);
    pipeline.renderFrame(1 / 60);

    const ctx = pipeline.getContext();
    expect(ctx.translate).toHaveBeenCalled();
    expect(ctx.scale).toHaveBeenCalled();
  });

  it('should clean up expired effects after render', () => {
    const canvas = createMockCanvas();
    const pipeline = new RenderPipeline({ canvas, width: 800, height: 600 });
    pipeline.updateState(createGameState());

    const effect = {
      id: 'expired',
      startTime: performance.now() - 2000,
      duration: 500,
      render: vi.fn(),
      isComplete: vi.fn(() => true),
    };

    pipeline.addEffect(effect);
    expect(pipeline.effectCount).toBe(1);

    pipeline.renderFrame(1 / 60);
    expect(pipeline.effectCount).toBe(0);
  });

  it('should support updating game state between frames', () => {
    const canvas = createMockCanvas();
    const pipeline = new RenderPipeline({ canvas, width: 800, height: 600 });

    const capturedStates: string[] = [];
    const layer: RenderLayer = {
      name: 'tracker',
      render(_ctx, state): void {
        capturedStates.push(state.phase);
      },
    };
    pipeline.addLayer(layer);

    pipeline.updateState({ ...createGameState(), phase: 'turn' });
    pipeline.renderFrame(1 / 60);

    pipeline.updateState({ ...createGameState(), phase: 'firing' });
    pipeline.renderFrame(1 / 60);

    expect(capturedStates).toEqual(['turn', 'firing']);
  });
});
