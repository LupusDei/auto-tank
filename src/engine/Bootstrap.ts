import { type SceneId, SceneManager } from '@engine/scene/SceneManager';
import { EventBus } from '@engine/events/EventBus';
import { InputManager } from '@engine/input/InputManager';

export interface BootstrapResult {
  readonly eventBus: EventBus;
  readonly sceneManager: SceneManager;
  readonly inputManager: InputManager;
}

/** Initialize all game systems and return handles. */
export function bootstrap(): BootstrapResult {
  const eventBus = new EventBus({ historySize: 1000 });
  const sceneManager = new SceneManager();
  const inputManager = new InputManager();

  // Register placeholder scenes
  const sceneIds: SceneId[] = ['main-menu', 'lobby', 'game-setup', 'playing', 'results'];
  for (const id of sceneIds) {
    sceneManager.register({ id });
  }

  // Start at main menu
  sceneManager.transition('main-menu');

  return { eventBus, sceneManager, inputManager };
}
