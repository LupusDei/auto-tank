import { describe, expect, it } from 'vitest';

import { createGameRenderer } from '@renderer/GameRenderer';

describe('GameRenderer', () => {
  const config = { canvasWidth: 800, canvasHeight: 600 };

  it('should create with initial camera centered on canvas', () => {
    const renderer = createGameRenderer(config);
    expect(renderer.camera.x).toBe(400);
    expect(renderer.camera.y).toBe(300);
    expect(renderer.camera.zoom).toBe(1);
  });

  it('should update camera toward target', () => {
    const renderer = createGameRenderer(config);
    renderer.updateCamera({ x: 600, y: 400 }, 0.016);
    expect(renderer.camera.x).toBeGreaterThan(400);
    expect(renderer.camera.y).toBeGreaterThan(300);
  });

  it('should trigger and report shake', () => {
    const renderer = createGameRenderer(config);
    expect(renderer.isShaking()).toBe(false);
    renderer.triggerShake(10);
    expect(renderer.isShaking()).toBe(true);
  });

  it('should return zero shake offset when not shaking', () => {
    const renderer = createGameRenderer(config);
    const offset = renderer.getShake();
    expect(offset.x).toBe(0);
    expect(offset.y).toBe(0);
  });
});
