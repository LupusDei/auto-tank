import { describe, expect, it, vi } from 'vitest';
import { type Scene, SceneManager } from '@engine/scene/SceneManager';

function createScene(
  id: Scene['id'],
): Scene & { enter: ReturnType<typeof vi.fn>; exit: ReturnType<typeof vi.fn> } {
  return { id, enter: vi.fn(), exit: vi.fn() };
}

describe('SceneManager', () => {
  it('should start with no scene', () => {
    const sm = new SceneManager();
    expect(sm.currentSceneId).toBeNull();
  });

  it('should transition to main-menu from initial state', () => {
    const sm = new SceneManager();
    sm.register(createScene('main-menu'));
    sm.transition('main-menu');
    expect(sm.currentSceneId).toBe('main-menu');
  });

  it('should call enter on new scene', () => {
    const sm = new SceneManager();
    const scene = createScene('main-menu');
    sm.register(scene);
    sm.transition('main-menu');
    expect(scene.enter).toHaveBeenCalledOnce();
  });

  it('should call exit on previous scene', () => {
    const sm = new SceneManager();
    const menu = createScene('main-menu');
    const lobby = createScene('lobby');
    sm.register(menu);
    sm.register(lobby);

    sm.transition('main-menu');
    sm.transition('lobby');

    expect(menu.exit).toHaveBeenCalledOnce();
    expect(lobby.enter).toHaveBeenCalledOnce();
  });

  it('should reject invalid transitions', () => {
    const sm = new SceneManager();
    sm.register(createScene('main-menu'));
    sm.register(createScene('playing'));

    sm.transition('main-menu');
    expect(() => sm.transition('playing')).toThrow('Invalid scene transition');
  });

  it('should reject transitions to unregistered scenes', () => {
    const sm = new SceneManager();
    sm.register(createScene('main-menu'));
    sm.transition('main-menu');
    expect(() => sm.transition('lobby')).toThrow("Scene 'lobby' not registered");
  });

  it('should follow valid transition chain', () => {
    const sm = new SceneManager();
    sm.register(createScene('main-menu'));
    sm.register(createScene('lobby'));
    sm.register(createScene('game-setup'));
    sm.register(createScene('playing'));
    sm.register(createScene('results'));

    sm.transition('main-menu');
    sm.transition('lobby');
    sm.transition('game-setup');
    sm.transition('playing');
    sm.transition('results');

    expect(sm.currentSceneId).toBe('results');
  });

  it('should allow returning to lobby from results', () => {
    const sm = new SceneManager();
    sm.register(createScene('main-menu'));
    sm.register(createScene('lobby'));
    sm.register(createScene('game-setup'));
    sm.register(createScene('playing'));
    sm.register(createScene('results'));

    sm.transition('main-menu');
    sm.transition('lobby');
    sm.transition('game-setup');
    sm.transition('playing');
    sm.transition('results');
    sm.transition('lobby');

    expect(sm.currentSceneId).toBe('lobby');
  });

  it('should check canTransition correctly', () => {
    const sm = new SceneManager();
    sm.register(createScene('main-menu'));
    sm.transition('main-menu');

    expect(sm.canTransition('lobby')).toBe(true);
    expect(sm.canTransition('playing')).toBe(false);
  });
});
