import type { RecordedAction } from './ActionRecorder';

export type ReplayState = 'idle' | 'playing' | 'paused' | 'finished';

/**
 * Deterministic playback of recorded actions.
 */
export class ReplayPlayer {
  private readonly actions: readonly RecordedAction[];
  private _state: ReplayState = 'idle';
  private _currentIndex = 0;
  private _speed = 1;

  constructor(actions: readonly RecordedAction[]) {
    this.actions = actions;
  }

  get state(): ReplayState {
    return this._state;
  }
  get currentIndex(): number {
    return this._currentIndex;
  }
  get totalActions(): number {
    return this.actions.length;
  }
  get speed(): number {
    return this._speed;
  }
  get progress(): number {
    return this.actions.length > 0 ? this._currentIndex / this.actions.length : 0;
  }
  get isComplete(): boolean {
    return this._currentIndex >= this.actions.length;
  }

  play(): void {
    this._state = 'playing';
  }
  pause(): void {
    if (this._state === 'playing') this._state = 'paused';
  }

  setSpeed(speed: number): void {
    this._speed = Math.max(0.25, Math.min(4, speed));
  }

  /** Advance to next action. Returns the action or null if done. */
  nextAction(): RecordedAction | null {
    if (this._state !== 'playing' || this._currentIndex >= this.actions.length) {
      if (this._currentIndex >= this.actions.length) this._state = 'finished';
      return null;
    }
    const action = this.actions[this._currentIndex] ?? null;
    this._currentIndex += 1;
    if (this._currentIndex >= this.actions.length) this._state = 'finished';
    return action;
  }

  /** Reset to beginning. */
  reset(): void {
    this._currentIndex = 0;
    this._state = 'idle';
  }

  /** Seek to a specific action index. */
  seekTo(index: number): void {
    this._currentIndex = Math.max(0, Math.min(this.actions.length, index));
    if (this._currentIndex >= this.actions.length) this._state = 'finished';
  }
}
