import { describe, expect, it } from 'vitest';
import { GameSession, type GameSessionConfig } from '@engine/scene/GameSession';

const defaultConfig: GameSessionConfig = {
  gameConfig: {
    maxRounds: 3,
    turnTimeSeconds: 30,
    startingMoney: 1000,
    windStrength: 10,
    gravity: 9.81,
    suddenDeathEnabled: false,
    suddenDeathTurns: 20,
  },
  terrainConfig: { width: 200, height: 600, seed: 42, roughness: 0.6, theme: 'classic' },
  playerNames: ['Alice', 'Bob'],
};

describe('GameSession', () => {
  it('should initialize in setup phase with terrain and players', () => {
    const session = new GameSession(defaultConfig);
    const state = session.gameState;

    expect(state.phase).toBe('setup');
    expect(state.players).toHaveLength(2);
    expect(state.terrain).not.toBeNull();
    expect(state.currentRound).toBe(1);
  });

  it('should place tanks on terrain', () => {
    const session = new GameSession(defaultConfig);
    const state = session.gameState;

    for (const player of state.players) {
      for (const tank of player.tanks) {
        expect(tank.position.x).toBeGreaterThan(0);
        expect(typeof tank.position.y).toBe('number');
      }
    }
  });

  it('should give players starting loadout', () => {
    const session = new GameSession(defaultConfig);
    const state = session.gameState;

    for (const player of state.players) {
      expect(player.inventory.length).toBeGreaterThan(0);
      expect(player.money).toBe(1000);
    }
  });

  it('should transition through round lifecycle', () => {
    const session = new GameSession(defaultConfig);

    session.startRound();
    expect(session.gameState.phase).toBe('playing');

    session.startTurn();
    expect(session.gameState.phase).toBe('turn');
  });

  it('should advance to next player on endCurrentTurn', () => {
    const session = new GameSession(defaultConfig);
    session.startRound();
    session.startTurn();

    expect(session.gameState.currentPlayerIndex).toBe(0);
    session.endCurrentTurn();
    expect(session.gameState.currentPlayerIndex).toBe(1);
  });

  it('should not be complete initially', () => {
    const session = new GameSession(defaultConfig);
    expect(session.isComplete).toBe(false);
  });
});
