import type { GameState } from '@shared/types/game';
import type { Player } from '@shared/types/entities';

/** Check if a player has any alive tanks. */
function isPlayerAlive(player: Player): boolean {
  return player.tanks.some((tank) => tank.state === 'alive');
}

/** Count players with at least one alive tank. */
export function getAlivePlayerCount(players: readonly Player[]): number {
  return players.filter(isPlayerAlive).length;
}

/** Check if the round should end (1 or fewer alive players). */
export function isRoundOver(state: GameState): boolean {
  return getAlivePlayerCount(state.players) <= 1;
}

/** Get the winner's player ID, or null if draw. */
export function getWinnerId(players: readonly Player[]): string | null {
  const alive = players.filter(isPlayerAlive);
  return alive.length === 1 && alive[0] ? alive[0].id : null;
}

/** End the current round: increment round, transition to next phase. */
export function endRound(state: GameState): GameState {
  const nextRound = state.currentRound + 1;
  const isMatchOver = state.currentRound >= state.config.maxRounds;

  return {
    ...state,
    currentRound: nextRound,
    phase: isMatchOver ? 'victory' : 'next-round',
  };
}
