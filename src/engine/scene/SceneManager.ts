export type SceneId = 'main-menu' | 'lobby' | 'game-setup' | 'playing' | 'results';

export interface Scene {
  readonly id: SceneId;
  enter?(): void;
  exit?(): void;
  update?(dt: number): void;
  render?(ctx: CanvasRenderingContext2D): void;
}

const VALID_TRANSITIONS: ReadonlyMap<SceneId, readonly SceneId[]> = new Map([
  ['main-menu', ['lobby']],
  ['lobby', ['game-setup', 'main-menu']],
  ['game-setup', ['playing', 'lobby']],
  ['playing', ['results']],
  ['results', ['lobby', 'main-menu']],
]);

/**
 * Manages scene transitions with enter/exit lifecycle hooks.
 */
export class SceneManager {
  private readonly scenes = new Map<SceneId, Scene>();
  private current: Scene | null = null;
  private _currentId: SceneId | null = null;

  /** Register a scene. */
  register(scene: Scene): void {
    this.scenes.set(scene.id, scene);
  }

  /** Get current scene ID. */
  get currentSceneId(): SceneId | null {
    return this._currentId;
  }

  /** Check if transition is valid. */
  canTransition(to: SceneId): boolean {
    if (!this._currentId) return to === 'main-menu';
    const allowed = VALID_TRANSITIONS.get(this._currentId);
    return allowed !== undefined && allowed.includes(to);
  }

  /** Transition to a new scene. */
  transition(to: SceneId): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid scene transition from '${this._currentId ?? 'none'}' to '${to}'`);
    }

    const next = this.scenes.get(to);
    if (!next) {
      throw new Error(`Scene '${to}' not registered`);
    }

    this.current?.exit?.();
    this.current = next;
    this._currentId = to;
    this.current.enter?.();
  }

  /** Update the current scene. */
  update(dt: number): void {
    this.current?.update?.(dt);
  }

  /** Render the current scene. */
  render(ctx: CanvasRenderingContext2D): void {
    this.current?.render?.(ctx);
  }
}
