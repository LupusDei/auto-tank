import { describe, expect, it, vi } from 'vitest';
import {
  endTurn,
  endTurnWithEvents,
  getNextPlayer,
  isLastPlayerStanding,
  startTurn,
  startTurnWithEvents,
} from '@engine/state/TurnManager';
import { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';
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

describe('TurnManager', () => {
  describe('getNextPlayer()', () => {
    it('should advance to the next player', () => {
      const players = [
        createPlayer('p1', true),
        createPlayer('p2', true),
        createPlayer('p3', true),
      ];
      expect(getNextPlayer(players, 0)).toBe(1);
      expect(getNextPlayer(players, 1)).toBe(2);
    });

    it('should wrap around to the first player', () => {
      const players = [createPlayer('p1', true), createPlayer('p2', true)];
      expect(getNextPlayer(players, 1)).toBe(0);
    });

    it('should skip destroyed players', () => {
      const players = [
        createPlayer('p1', true),
        createPlayer('p2', false),
        createPlayer('p3', true),
      ];
      expect(getNextPlayer(players, 0)).toBe(2);
    });

    it('should wrap around and skip destroyed players', () => {
      const players = [
        createPlayer('p1', true),
        createPlayer('p2', false),
        createPlayer('p3', false),
      ];
      // Only p1 is alive, so next after p1 is p1 again
      expect(getNextPlayer(players, 0)).toBe(0);
    });

    it('should return -1 when no alive players remain', () => {
      const players = [createPlayer('p1', false), createPlayer('p2', false)];
      expect(getNextPlayer(players, 0)).toBe(-1);
    });
  });

  describe('isLastPlayerStanding()', () => {
    it('should return true when only one player has alive tanks', () => {
      const players = [
        createPlayer('p1', true),
        createPlayer('p2', false),
        createPlayer('p3', false),
      ];
      expect(isLastPlayerStanding(players)).toBe(true);
    });

    it('should return false when multiple players have alive tanks', () => {
      const players = [
        createPlayer('p1', true),
        createPlayer('p2', true),
        createPlayer('p3', false),
      ];
      expect(isLastPlayerStanding(players)).toBe(false);
    });

    it('should return false when no players are alive', () => {
      const players = [createPlayer('p1', false), createPlayer('p2', false)];
      expect(isLastPlayerStanding(players)).toBe(false);
    });
  });

  describe('startTurn()', () => {
    it('should set current player and reset turn timer', () => {
      const state = {
        phase: 'turn' as const,
        players: [createPlayer('p1', true), createPlayer('p2', true)],
        terrain: null,
        currentPlayerIndex: 0,
        currentRound: 1,
        wind: 0,
        config: {
          maxRounds: 10,
          turnTimeSeconds: 30,
          startingMoney: 1000,
          windStrength: 10,
          gravity: 9.81,
          suddenDeathEnabled: false,
          suddenDeathTurns: 20,
          wallMode: 'open' as const,
        },
        turnTimer: 0,
      };

      const result = startTurn(state, 0);

      expect(result.currentPlayerIndex).toBe(0);
      expect(result.turnTimer).toBe(30);
    });
  });

  describe('endTurn()', () => {
    it('should advance to the next alive player', () => {
      const state = {
        phase: 'turn' as const,
        players: [createPlayer('p1', true), createPlayer('p2', true)],
        terrain: null,
        currentPlayerIndex: 0,
        currentRound: 1,
        wind: 0,
        config: {
          maxRounds: 10,
          turnTimeSeconds: 30,
          startingMoney: 1000,
          windStrength: 10,
          gravity: 9.81,
          suddenDeathEnabled: false,
          suddenDeathTurns: 20,
          wallMode: 'open' as const,
        },
        turnTimer: 15,
      };

      const result = endTurn(state);
      expect(result.currentPlayerIndex).toBe(1);
    });

    it('should transition to resolution phase when all players dead', () => {
      const state = {
        phase: 'turn' as const,
        players: [createPlayer('p1', false), createPlayer('p2', false)],
        terrain: null,
        currentPlayerIndex: 0,
        currentRound: 1,
        wind: 0,
        config: {
          maxRounds: 10,
          turnTimeSeconds: 30,
          startingMoney: 1000,
          windStrength: 10,
          gravity: 9.81,
          suddenDeathEnabled: false,
          suddenDeathTurns: 20,
          wallMode: 'open' as const,
        },
        turnTimer: 0,
      };

      const result = endTurn(state);
      expect(result.phase).toBe('resolution');
    });

    it('should wrap around when at the last player', () => {
      const state = {
        phase: 'turn' as const,
        players: [createPlayer('p1', true), createPlayer('p2', true)],
        terrain: null,
        currentPlayerIndex: 1,
        currentRound: 1,
        wind: 0,
        config: {
          maxRounds: 10,
          turnTimeSeconds: 30,
          startingMoney: 1000,
          windStrength: 10,
          gravity: 9.81,
          suddenDeathEnabled: false,
          suddenDeathTurns: 20,
          wallMode: 'open' as const,
        },
        turnTimer: 0,
      };

      const result = endTurn(state);
      expect(result.currentPlayerIndex).toBe(0);
    });
  });

  describe('startTurnWithEvents()', () => {
    it('should emit TURN_STARTED event with correct payload', () => {
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.TURN_STARTED, handler);

      const state = {
        phase: 'turn' as const,
        players: [createPlayer('p1', true), createPlayer('p2', true)],
        terrain: null,
        currentPlayerIndex: 0,
        currentRound: 1,
        wind: 0,
        config: {
          maxRounds: 10,
          turnTimeSeconds: 30,
          startingMoney: 1000,
          windStrength: 10,
          gravity: 9.81,
          suddenDeathEnabled: false,
          suddenDeathTurns: 20,
          wallMode: 'open' as const,
        },
        turnTimer: 0,
      };

      const result = startTurnWithEvents(state, 1, 5, bus);

      expect(result.currentPlayerIndex).toBe(1);
      expect(result.turnTimer).toBe(30);
      expect(handler).toHaveBeenCalledOnce();
      expect((handler.mock.calls[0] as [{ payload: unknown }])[0].payload).toEqual({
        playerId: 'p2',
        tankId: 'tank-p2',
        turnNumber: 5,
      });
    });

    it('should not emit event when player index is out of bounds', () => {
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.TURN_STARTED, handler);

      const state = {
        phase: 'turn' as const,
        players: [createPlayer('p1', true)],
        terrain: null,
        currentPlayerIndex: 0,
        currentRound: 1,
        wind: 0,
        config: {
          maxRounds: 10,
          turnTimeSeconds: 30,
          startingMoney: 1000,
          windStrength: 10,
          gravity: 9.81,
          suddenDeathEnabled: false,
          suddenDeathTurns: 20,
          wallMode: 'open' as const,
        },
        turnTimer: 0,
      };

      startTurnWithEvents(state, 5, 1, bus);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('endTurnWithEvents()', () => {
    it('should emit TURN_ENDED event with fired reason', () => {
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.TURN_ENDED, handler);

      const state = {
        phase: 'turn' as const,
        players: [createPlayer('p1', true), createPlayer('p2', true)],
        terrain: null,
        currentPlayerIndex: 0,
        currentRound: 1,
        wind: 0,
        config: {
          maxRounds: 10,
          turnTimeSeconds: 30,
          startingMoney: 1000,
          windStrength: 10,
          gravity: 9.81,
          suddenDeathEnabled: false,
          suddenDeathTurns: 20,
          wallMode: 'open' as const,
        },
        turnTimer: 15,
      };

      const result = endTurnWithEvents(state, 3, 'fired', bus);

      expect(result.currentPlayerIndex).toBe(1);
      expect(result.turnTimer).toBe(0);
      expect(handler).toHaveBeenCalledOnce();
      expect((handler.mock.calls[0] as [{ payload: unknown }])[0].payload).toEqual({
        playerId: 'p1',
        tankId: 'tank-p1',
        turnNumber: 3,
        reason: 'fired',
      });
    });

    it('should emit TURN_ENDED with timeout reason', () => {
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.TURN_ENDED, handler);

      const state = {
        phase: 'turn' as const,
        players: [createPlayer('p1', true), createPlayer('p2', true)],
        terrain: null,
        currentPlayerIndex: 0,
        currentRound: 1,
        wind: 0,
        config: {
          maxRounds: 10,
          turnTimeSeconds: 30,
          startingMoney: 1000,
          windStrength: 10,
          gravity: 9.81,
          suddenDeathEnabled: false,
          suddenDeathTurns: 20,
          wallMode: 'open' as const,
        },
        turnTimer: 0,
      };

      endTurnWithEvents(state, 7, 'timeout', bus);
      expect((handler.mock.calls[0] as [{ payload: { reason: string } }])[0].payload.reason).toBe(
        'timeout',
      );
    });
  });
});
