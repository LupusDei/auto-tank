import { describe, expect, it } from 'vitest';
import {
  endRound,
  getAlivePlayerCount,
  getWinnerId,
  isRoundOver,
} from '@engine/state/RoundManager';
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

function createGameState(players: Player[]): GameState {
  return {
    phase: 'playing',
    players,
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
    turnTimer: 30,
  };
}

describe('RoundManager', () => {
  describe('isRoundOver()', () => {
    it('should return true when one or fewer players alive', () => {
      const state = createGameState([
        createPlayer('p1', true),
        createPlayer('p2', false),
        createPlayer('p3', false),
      ]);
      expect(isRoundOver(state)).toBe(true);
    });

    it('should return false when multiple players alive', () => {
      const state = createGameState([createPlayer('p1', true), createPlayer('p2', true)]);
      expect(isRoundOver(state)).toBe(false);
    });

    it('should return true when no players alive', () => {
      const state = createGameState([createPlayer('p1', false), createPlayer('p2', false)]);
      expect(isRoundOver(state)).toBe(true);
    });
  });

  describe('getAlivePlayerCount()', () => {
    it('should count players with alive tanks', () => {
      const players = [
        createPlayer('p1', true),
        createPlayer('p2', false),
        createPlayer('p3', true),
      ];
      expect(getAlivePlayerCount(players)).toBe(2);
    });
  });

  describe('getWinnerId()', () => {
    it('should return the last standing player id', () => {
      const players = [
        createPlayer('p1', false),
        createPlayer('p2', true),
        createPlayer('p3', false),
      ];
      expect(getWinnerId(players)).toBe('p2');
    });

    it('should return null when no players alive (draw)', () => {
      const players = [createPlayer('p1', false), createPlayer('p2', false)];
      expect(getWinnerId(players)).toBeNull();
    });
  });

  describe('endRound()', () => {
    it('should increment round number', () => {
      const state = createGameState([createPlayer('p1', true), createPlayer('p2', false)]);
      const result = endRound(state);
      expect(result.currentRound).toBe(2);
    });

    it('should detect match victory when maxRounds reached', () => {
      const state = {
        ...createGameState([createPlayer('p1', true), createPlayer('p2', false)]),
        currentRound: 10,
      };
      const result = endRound(state);
      expect(result.phase).toBe('victory');
    });

    it('should transition to next-round when more rounds remain', () => {
      const state = createGameState([createPlayer('p1', true), createPlayer('p2', false)]);
      const result = endRound(state);
      expect(result.phase).toBe('next-round');
    });
  });
});
