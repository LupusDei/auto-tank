import type { GamePhase } from '@shared/types/game';

const VALID_TRANSITIONS: ReadonlyMap<GamePhase, readonly GamePhase[]> = new Map<
  GamePhase,
  readonly GamePhase[]
>([
  ['lobby', ['setup']],
  ['setup', ['playing']],
  ['playing', ['turn']],
  ['turn', ['firing']],
  ['firing', ['resolution']],
  ['resolution', ['shop', 'next-round', 'victory']],
  ['shop', ['next-round']],
  ['next-round', ['playing']],
]);

export class GameStateMachine {
  private _currentPhase: GamePhase = 'lobby';

  get currentPhase(): GamePhase {
    return this._currentPhase;
  }

  canTransition(to: GamePhase): boolean {
    const allowed = VALID_TRANSITIONS.get(this._currentPhase);
    return allowed !== undefined && allowed.includes(to);
  }

  transition(to: GamePhase): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition from '${this._currentPhase}' to '${to}'`);
    }
    this._currentPhase = to;
  }
}
