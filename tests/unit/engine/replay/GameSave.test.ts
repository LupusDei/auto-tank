import {
  createGameSave,
  deserializeSave,
  getLastShotReplay,
  serializeSave,
} from '@engine/replay/GameSave';
import { describe, expect, it } from 'vitest';
import type { GameState } from '@shared/types/game';
import type { RecordedAction } from '@engine/replay/ActionRecorder';

const state: GameState = {
  phase: 'playing',
  players: [],
  terrain: null,
  currentPlayerIndex: 0,
  currentRound: 1,
  wind: 0,
  turnTimer: 30,
  config: {
    maxRounds: 3,
    turnTimeSeconds: 30,
    startingMoney: 1000,
    windStrength: 10,
    gravity: 9.81,
    suddenDeathEnabled: false,
    suddenDeathTurns: 20,
    wallMode: 'open' as const,
  },
};

const actions: RecordedAction[] = [
  {
    action: { playerId: 'p1', tankId: 't1', weaponType: 'missile', angle: 45, power: 80 },
    timestamp: 100,
    turnNumber: 1,
    roundNumber: 1,
  },
];

describe('GameSave', () => {
  it('should create save data', () => {
    const save = createGameSave(state, actions, 42);
    expect(save.version).toBe(1);
    expect(save.seed).toBe(42);
    expect(save.actions).toHaveLength(1);
  });

  it('should round-trip serialize/deserialize', () => {
    const save = createGameSave(state, actions, 42);
    const json = serializeSave(save);
    const loaded = deserializeSave(json);
    expect(loaded).not.toBeNull();
    expect(loaded?.seed).toBe(42);
    expect(loaded?.actions).toHaveLength(1);
  });

  it('should return null for invalid JSON', () => {
    expect(deserializeSave('not json')).toBeNull();
    expect(deserializeSave('{}')).toBeNull();
  });

  it('should get last shot replay', () => {
    const lastShot = getLastShotReplay(actions);
    expect(lastShot).toHaveLength(1);
    expect(getLastShotReplay([])).toHaveLength(0);
  });
});
