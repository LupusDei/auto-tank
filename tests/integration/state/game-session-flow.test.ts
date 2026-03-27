import { describe, expect, it } from 'vitest';
import {
  emitPhaseChanged,
  emitRoundEnded,
  emitRoundStarted,
} from '@engine/state/GameSessionEvents';
import { endRound, isRoundOver } from '@engine/state/RoundManager';
import { endTurn, startTurn, startTurnWithEvents } from '@engine/state/TurnManager';
import { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';
import { GameSessionManager } from '@engine/state/GameSessionManager';
import type { GameState } from '@shared/types/game';
import type { Player } from '@shared/types/entities';

function createPlayer(id: string, alive: boolean): Player {
  return {
    id,
    name: `Player ${id}`,
    color: 'red',
    tanks: [
      {
        id: `tank-${id}`,
        playerId: id,
        position: { x: 0, y: 0 },
        angle: 45,
        power: 50,
        health: alive ? 100 : 0,
        maxHealth: 100,
        fuel: 100,
        state: alive ? 'alive' : 'destroyed',
        color: 'red',
        selectedWeapon: null,
      },
    ],
    money: 1000,
    inventory: [],
    kills: 0,
    deaths: alive ? 0 : 1,
    isAI: false,
  };
}

describe('Game Session Flow Integration', () => {
  it('should orchestrate full lobby → setup → playing → turns → round end', () => {
    const bus = new EventBus({ historySize: 100 });
    const session = new GameSessionManager({
      maxRounds: 2,
      turnTimeSeconds: 30,
      startingMoney: 1000,
      windStrength: 10,
      gravity: 9.81,
      suddenDeathEnabled: false,
      suddenDeathTurns: 20,
      wallMode: 'open' as const,
    });

    // Lobby phase
    expect(session.currentPhase).toBe('lobby');
    session.addPlayer('p1', 'Alice');
    session.addPlayer('p2', 'Bob');

    // Setup
    emitPhaseChanged(bus, 'lobby', 'setup');
    session.startSetup();
    expect(session.currentPhase).toBe('setup');

    // Playing
    emitPhaseChanged(bus, 'setup', 'playing');
    session.startPlaying();
    expect(session.currentPhase).toBe('playing');

    // Start round
    emitRoundStarted(bus, 1, ['p1', 'p2']);

    // Verify events were emitted
    const history = bus.getHistory();
    expect(history.length).toBeGreaterThanOrEqual(3);
  });

  it('should detect round over when one player eliminated', () => {
    const state: GameState = {
      phase: 'turn',
      terrain: null,
      currentPlayerIndex: 0,
      currentRound: 1,
      wind: 0,
      turnTimer: 30,
      players: [createPlayer('p1', true), createPlayer('p2', false)],
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

    expect(isRoundOver(state)).toBe(true);
  });

  it('should advance turns between alive players', () => {
    const bus = new EventBus();
    const state: GameState = {
      phase: 'turn',
      terrain: null,
      currentPlayerIndex: 0,
      currentRound: 1,
      wind: 0,
      turnTimer: 30,
      players: [createPlayer('p1', true), createPlayer('p2', true), createPlayer('p3', false)],
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

    // Turn 1: p1
    const turn1 = startTurnWithEvents(state, 0, 1, bus);
    expect(turn1.currentPlayerIndex).toBe(0);

    // End turn 1 → should skip dead p3, go to p2
    const afterTurn1 = endTurn(turn1);
    expect(afterTurn1.currentPlayerIndex).toBe(1);

    // Turn 2: p2
    const turn2 = startTurn(afterTurn1, 1);
    expect(turn2.currentPlayerIndex).toBe(1);

    // End turn 2 → should skip dead p3, go to p1
    const afterTurn2 = endTurn(turn2);
    expect(afterTurn2.currentPlayerIndex).toBe(0);
  });

  it('should emit ROUND_ENDED and transition correctly', () => {
    const bus = new EventBus({ historySize: 50 });

    const state: GameState = {
      phase: 'resolution',
      terrain: null,
      currentPlayerIndex: 0,
      currentRound: 1,
      wind: 0,
      turnTimer: 0,
      players: [createPlayer('p1', true), createPlayer('p2', false)],
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

    emitRoundEnded(bus, 1, 'p1');
    const nextState = endRound(state);

    expect(nextState.phase).toBe('next-round');
    expect(nextState.currentRound).toBe(2);

    const history = bus.getHistory();
    expect(history.some((e) => e.type === EventType.ROUND_ENDED)).toBe(true);
  });
});
