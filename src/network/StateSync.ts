import type { GameState } from '@shared/types/game';

export interface SyncState {
  readonly serverState: GameState | null;
  readonly localState: GameState | null;
  readonly serverTick: number;
  readonly localTick: number;
  readonly latencyMs: number;
}

/** Create initial sync state. */
export function createSyncState(): SyncState {
  return { serverState: null, localState: null, serverTick: 0, localTick: 0, latencyMs: 0 };
}

/** Apply authoritative server state. */
export function applyServerState(sync: SyncState, state: GameState, tick: number): SyncState {
  return { ...sync, serverState: state, serverTick: tick };
}

/** Apply local prediction (client-side). */
export function applyLocalPrediction(sync: SyncState, state: GameState): SyncState {
  return { ...sync, localState: state, localTick: sync.localTick + 1 };
}

/** Check if local state diverged from server. */
export function hasDiverged(sync: SyncState): boolean {
  if (!sync.serverState || !sync.localState) return false;
  return sync.localTick > sync.serverTick + 5;
}

/** Reconcile: snap to server state when diverged. */
export function reconcile(sync: SyncState): SyncState {
  if (!sync.serverState) return sync;
  return {
    ...sync,
    localState: sync.serverState,
    localTick: sync.serverTick,
  };
}

/** Update latency measurement. */
export function updateLatency(sync: SyncState, latencyMs: number): SyncState {
  return { ...sync, latencyMs };
}

/** Get the best state to render (local prediction or server). */
export function getRenderState(sync: SyncState): GameState | null {
  return sync.localState ?? sync.serverState;
}
