import type { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';
import type { GamePhase } from '@shared/types/game';

/** Emit ROUND_STARTED event. */
export function emitRoundStarted(
  bus: EventBus,
  roundNumber: number,
  playerIds: readonly string[],
): void {
  bus.emit(EventType.ROUND_STARTED, { roundNumber, playerIds });
}

/** Emit ROUND_ENDED event. */
export function emitRoundEnded(bus: EventBus, roundNumber: number, winnerId: string | null): void {
  bus.emit(EventType.ROUND_ENDED, { roundNumber, winnerId });
}

/** Emit PHASE_CHANGED event. */
export function emitPhaseChanged(
  bus: EventBus,
  previousPhase: GamePhase,
  newPhase: GamePhase,
): void {
  bus.emit(EventType.PHASE_CHANGED, { previousPhase, newPhase });
}
