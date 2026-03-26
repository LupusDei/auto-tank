import type { GameState } from '@shared/types/game';
import type { RecordedAction } from './ActionRecorder';

export interface GameSaveData {
  readonly version: number;
  readonly timestamp: number;
  readonly initialState: GameState;
  readonly actions: readonly RecordedAction[];
  readonly seed: number;
}

/** Create a save from initial state and recorded actions. */
export function createGameSave(
  initialState: GameState,
  actions: readonly RecordedAction[],
  seed: number,
): GameSaveData {
  return { version: 1, timestamp: Date.now(), initialState, actions, seed };
}

/** Serialize a save to JSON string. */
export function serializeSave(save: GameSaveData): string {
  return JSON.stringify(save);
}

/** Deserialize a save from JSON string. Returns null on invalid data. */
export function deserializeSave(json: string): GameSaveData | null {
  try {
    const data = JSON.parse(json) as Record<string, unknown>;
    if (typeof data['version'] !== 'number' || typeof data['seed'] !== 'number') return null;
    return data as unknown as GameSaveData;
  } catch {
    return null;
  }
}

/** Get last-shot replay (last action only). */
export function getLastShotReplay(actions: readonly RecordedAction[]): readonly RecordedAction[] {
  if (actions.length === 0) return [];
  const last = actions[actions.length - 1];
  return last ? [last] : [];
}
