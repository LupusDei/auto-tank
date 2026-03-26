import type { NetworkClient } from './NetworkClient';
import type { TurnAction } from '@shared/types/game';

export interface TurnValidation {
  readonly valid: boolean;
  readonly reason?: string;
}

/** Validate a turn action before sending to server. */
export function validateTurnAction(action: TurnAction, currentPlayerId: string): TurnValidation {
  if (action.playerId !== currentPlayerId) {
    return { valid: false, reason: 'Not your turn' };
  }
  if (action.power < 0 || action.power > 100) {
    return { valid: false, reason: 'Power out of range' };
  }
  if (action.angle < 0 || action.angle > 180) {
    return { valid: false, reason: 'Angle out of range' };
  }
  return { valid: true };
}

/** Send a validated turn action through the network. */
export function sendTurnAction(client: NetworkClient, action: TurnAction): boolean {
  const validation = validateTurnAction(action, action.playerId);
  if (!validation.valid) return false;
  client.send({ type: 'turn_action', action });
  return true;
}

/** Receive and validate an incoming turn action from another player. */
export function receiveTurnAction(payload: unknown, expectedPlayerId: string): TurnAction | null {
  if (!payload || typeof payload !== 'object') return null;
  const action = payload as Record<string, unknown>;

  if (typeof action['playerId'] !== 'string') return null;
  if (action['playerId'] !== expectedPlayerId) return null;
  if (typeof action['angle'] !== 'number') return null;
  if (typeof action['power'] !== 'number') return null;

  return payload as TurnAction;
}
