import {
  applyLocalPrediction,
  applyServerState,
  createSyncState,
  getRenderState,
  hasDiverged,
  reconcile,
  updateLatency,
} from '@network/StateSync';
import { describe, expect, it } from 'vitest';
import type { GameState } from '@shared/types/game';

function makeState(phase: GameState['phase'] = 'playing'): GameState {
  return {
    phase,
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
    },
  };
}

describe('StateSync', () => {
  it('should create empty sync state', () => {
    const sync = createSyncState();
    expect(sync.serverState).toBeNull();
    expect(sync.localState).toBeNull();
  });

  it('should apply server state', () => {
    const sync = applyServerState(createSyncState(), makeState(), 10);
    expect(sync.serverState).not.toBeNull();
    expect(sync.serverTick).toBe(10);
  });

  it('should apply local prediction', () => {
    const sync = applyLocalPrediction(createSyncState(), makeState('turn'));
    expect(sync.localState?.phase).toBe('turn');
    expect(sync.localTick).toBe(1);
  });

  it('should detect divergence', () => {
    let sync = createSyncState();
    sync = applyServerState(sync, makeState(), 0);
    for (let i = 0; i < 10; i++) {
      sync = applyLocalPrediction(sync, makeState());
    }
    expect(hasDiverged(sync)).toBe(true);
  });

  it('should not detect divergence when close', () => {
    let sync = applyServerState(createSyncState(), makeState(), 5);
    sync = applyLocalPrediction(sync, makeState());
    expect(hasDiverged(sync)).toBe(false);
  });

  it('should reconcile by snapping to server', () => {
    let sync = applyServerState(createSyncState(), makeState('firing'), 10);
    sync = applyLocalPrediction(sync, makeState('turn'));
    const reconciled = reconcile(sync);
    expect(reconciled.localState?.phase).toBe('firing');
    expect(reconciled.localTick).toBe(10);
  });

  it('should track latency', () => {
    const sync = updateLatency(createSyncState(), 42);
    expect(sync.latencyMs).toBe(42);
  });

  it('should return best render state', () => {
    const sync = applyLocalPrediction(
      applyServerState(createSyncState(), makeState('playing'), 1),
      makeState('turn'),
    );
    expect(getRenderState(sync)?.phase).toBe('turn');
  });

  it('should fall back to server state for render', () => {
    const sync = applyServerState(createSyncState(), makeState('playing'), 1);
    expect(getRenderState(sync)?.phase).toBe('playing');
  });
});
