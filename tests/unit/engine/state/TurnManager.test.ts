import { describe, expect, it } from 'vitest';
import { endTurn, getNextPlayer, isLastPlayerStanding, startTurn } from '@engine/state/TurnManager';
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
        },
        turnTimer: 15,
      };

      const result = endTurn(state);
      expect(result.currentPlayerIndex).toBe(1);
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
        },
        turnTimer: 0,
      };

      const result = endTurn(state);
      expect(result.currentPlayerIndex).toBe(0);
    });
  });
});
