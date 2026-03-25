import type { GameState } from '@shared/types/game';
import type { Player } from '@shared/types/entities';

/** Check if a player has any alive tanks. */
function isPlayerAlive(player: Player): boolean {
  return player.tanks.some((tank) => tank.state === 'alive');
}

/** Get the next alive player index after currentIndex. Returns -1 if none alive. */
export function getNextPlayer(players: readonly Player[], currentIndex: number): number {
  const count = players.length;
  for (let i = 1; i <= count; i++) {
    const idx = (currentIndex + i) % count;
    const player = players[idx];
    if (player && isPlayerAlive(player)) {
      return idx;
    }
  }
  return -1;
}

/** Returns true if exactly one player has alive tanks. */
export function isLastPlayerStanding(players: readonly Player[]): boolean {
  let aliveCount = 0;
  for (const player of players) {
    if (isPlayerAlive(player)) {
      aliveCount += 1;
    }
  }
  return aliveCount === 1;
}

/** Start a turn for the given player index. Resets turn timer. */
export function startTurn(state: GameState, playerIndex: number): GameState {
  return {
    ...state,
    currentPlayerIndex: playerIndex,
    turnTimer: state.config.turnTimeSeconds,
  };
}

/** End the current turn and advance to the next alive player. */
export function endTurn(state: GameState): GameState {
  const nextIndex = getNextPlayer(state.players, state.currentPlayerIndex);
  return {
    ...state,
    currentPlayerIndex: nextIndex === -1 ? state.currentPlayerIndex : nextIndex,
    turnTimer: 0,
  };
}
