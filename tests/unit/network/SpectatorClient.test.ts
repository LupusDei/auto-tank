import { describe, expect, it } from 'vitest';
import type { GameState } from '@shared/types/game';
import { NetworkClient } from '@network/NetworkClient';
import { SpectatorClient } from '@network/SpectatorClient';

function makeState(): GameState {
  return {
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
}

describe('SpectatorClient', () => {
  it('should not be spectating initially', () => {
    const client = new NetworkClient();
    const spec = new SpectatorClient(client);
    expect(spec.isSpectating).toBe(false);
  });

  it('should start spectating a room', () => {
    const client = new NetworkClient();
    const spec = new SpectatorClient(client);
    spec.spectate('room-1');
    expect(spec.isSpectating).toBe(true);
    expect(spec.roomId).toBe('room-1');
  });

  it('should receive state updates', () => {
    const client = new NetworkClient();
    const spec = new SpectatorClient(client);
    spec.spectate('room-1');
    spec.handleStateUpdate(makeState());
    expect(spec.currentState?.phase).toBe('playing');
  });

  it('should clear state on stop', () => {
    const client = new NetworkClient();
    const spec = new SpectatorClient(client);
    spec.spectate('room-1');
    spec.handleStateUpdate(makeState());
    spec.stop();
    expect(spec.isSpectating).toBe(false);
    expect(spec.currentState).toBeNull();
  });
});
