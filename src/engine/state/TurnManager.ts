import { EventType, type TurnEndedPayload } from '@engine/events/types';
import type { EventBus } from '@engine/events/EventBus';
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

/** End the current turn and advance to the next alive player.
 *  Transitions to 'resolution' phase if no alive players remain. */
export function endTurn(state: GameState): GameState {
  const nextIndex = getNextPlayer(state.players, state.currentPlayerIndex);
  if (nextIndex === -1) {
    return {
      ...state,
      phase: 'resolution',
      turnTimer: 0,
    };
  }
  return {
    ...state,
    currentPlayerIndex: nextIndex,
    turnTimer: 0,
  };
}

/**
 * Start a turn and emit TURN_STARTED event.
 * Wraps the pure startTurn with EventBus integration.
 */
export function startTurnWithEvents(
  state: GameState,
  playerIndex: number,
  turnNumber: number,
  bus: EventBus,
): GameState {
  const newState = startTurn(state, playerIndex);

  const player = newState.players[playerIndex];
  if (player) {
    const aliveTank = player.tanks.find((t) => t.state === 'alive');
    bus.emit(EventType.TURN_STARTED, {
      playerId: player.id,
      tankId: aliveTank?.id ?? player.tanks[0]?.id ?? 'unknown',
      turnNumber,
    });
  }

  return newState;
}

/**
 * End the current turn and emit TURN_ENDED event.
 * Wraps the pure endTurn with EventBus integration.
 */
export function endTurnWithEvents(
  state: GameState,
  turnNumber: number,
  reason: TurnEndedPayload['reason'],
  bus: EventBus,
): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const aliveTank = currentPlayer?.tanks.find((t) => t.state === 'alive');

  bus.emit(EventType.TURN_ENDED, {
    playerId: currentPlayer?.id ?? 'unknown',
    tankId: aliveTank?.id ?? currentPlayer?.tanks[0]?.id ?? 'unknown',
    turnNumber,
    reason,
  });

  return endTurn(state);
}
