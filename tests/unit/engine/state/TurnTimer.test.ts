import {
  applySuddenDeathDrain,
  isSuddenDeathActive,
  isTimerExpired,
  tickTimer,
  updateTurnTimer,
} from '@engine/state/TurnTimer';
import { describe, expect, it } from 'vitest';
import type { Player } from '@shared/types/entities';

function createPlayer(id: string, health: number): Player {
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
        health,
        maxHealth: 100,
        fuel: 100,
        state: health > 0 ? 'alive' : 'destroyed',
        color: 'red',
        selectedWeapon: null,
      },
    ],
    money: 1000,
    inventory: [],
    kills: 0,
    deaths: 0,
    isAI: false,
  };
}

describe('TurnTimer', () => {
  describe('tickTimer()', () => {
    it('should decrease timer by dt', () => {
      expect(tickTimer(30, 1)).toBe(29);
    });

    it('should not go below 0', () => {
      expect(tickTimer(0.5, 1)).toBe(0);
    });
  });

  describe('isTimerExpired()', () => {
    it('should return true when timer is 0', () => {
      expect(isTimerExpired(0)).toBe(true);
    });

    it('should return false when timer has time remaining', () => {
      expect(isTimerExpired(15)).toBe(false);
    });
  });

  describe('isSuddenDeathActive()', () => {
    it('should activate at configured turn count', () => {
      expect(isSuddenDeathActive(20, 20, true)).toBe(true);
    });

    it('should not activate before threshold', () => {
      expect(isSuddenDeathActive(10, 20, true)).toBe(false);
    });

    it('should not activate when disabled', () => {
      expect(isSuddenDeathActive(30, 20, false)).toBe(false);
    });
  });

  describe('applySuddenDeathDrain()', () => {
    it('should drain health from alive tanks', () => {
      const players = [createPlayer('p1', 100), createPlayer('p2', 50)];
      const result = applySuddenDeathDrain(players, 10);

      expect(result[0]?.tanks[0]?.health).toBe(90);
      expect(result[1]?.tanks[0]?.health).toBe(40);
    });

    it('should destroy tanks at 0 health', () => {
      const players = [createPlayer('p1', 5)];
      const result = applySuddenDeathDrain(players, 10);

      expect(result[0]?.tanks[0]?.health).toBe(0);
      expect(result[0]?.tanks[0]?.state).toBe('destroyed');
    });

    it('should skip already destroyed tanks', () => {
      const players = [createPlayer('p1', 0)];
      const result = applySuddenDeathDrain(players, 10);

      expect(result[0]?.tanks[0]?.health).toBe(0);
    });
  });

  describe('updateTurnTimer()', () => {
    it('should update game state timer', () => {
      const state = {
        phase: 'turn' as const,
        players: [],
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
        turnTimer: 30,
      };

      const result = updateTurnTimer(state, 5);
      expect(result.turnTimer).toBe(25);
    });
  });
});
