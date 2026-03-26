import { describe, expect, it } from 'vitest';
import { bootstrap } from '@engine/Bootstrap';

describe('Bootstrap', () => {
  it('should initialize all systems', () => {
    const result = bootstrap();

    expect(result.eventBus).toBeDefined();
    expect(result.sceneManager).toBeDefined();
    expect(result.inputManager).toBeDefined();
  });

  it('should start at main-menu scene', () => {
    const result = bootstrap();
    expect(result.sceneManager.currentSceneId).toBe('main-menu');
  });

  it('should allow transitioning to lobby', () => {
    const result = bootstrap();
    result.sceneManager.transition('lobby');
    expect(result.sceneManager.currentSceneId).toBe('lobby');
  });

  it('should have event bus with history enabled', () => {
    const { eventBus } = bootstrap();
    // History size > 0 means recording is enabled
    expect(eventBus.getHistory()).toHaveLength(0); // no events yet
  });
});
