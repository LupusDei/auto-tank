import type { Player, Tank } from '@shared/types/entities';
import type { GameState } from '@shared/types/game';

/** Tick the turn timer down by dt seconds. Returns new timer value. */
export function tickTimer(currentTimer: number, dt: number): number {
  return Math.max(0, currentTimer - dt);
}

/** Check if the turn timer has expired. */
export function isTimerExpired(timer: number): boolean {
  return timer <= 0;
}

/** Check if sudden death should be active based on total turns played. */
export function isSuddenDeathActive(
  totalTurns: number,
  suddenDeathTurns: number,
  enabled: boolean,
): boolean {
  return enabled && totalTurns >= suddenDeathTurns;
}

/** Apply sudden death health drain to all alive tanks. Returns updated players. */
export function applySuddenDeathDrain(players: readonly Player[], drainAmount: number): Player[] {
  return players.map((player) => ({
    ...player,
    tanks: player.tanks.map((tank): Tank => {
      if (tank.state !== 'alive') return tank;
      const newHealth = Math.max(0, tank.health - drainAmount);
      return {
        ...tank,
        health: newHealth,
        state: newHealth <= 0 ? 'destroyed' : tank.state,
      };
    }),
  }));
}

/** Update game state with timer tick. */
export function updateTurnTimer(state: GameState, dt: number): GameState {
  return {
    ...state,
    turnTimer: tickTimer(state.turnTimer, dt),
  };
}
