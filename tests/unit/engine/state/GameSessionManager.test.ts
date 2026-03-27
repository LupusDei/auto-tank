import { describe, expect, it } from 'vitest';
import type { GameConfig } from '@shared/types/game';
import { GameSessionManager } from '@engine/state/GameSessionManager';

const defaultConfig: GameConfig = {
  maxRounds: 3,
  turnTimeSeconds: 30,
  startingMoney: 1000,
  windStrength: 10,
  gravity: 9.81,
  suddenDeathEnabled: false,
  suddenDeathTurns: 20,
  wallMode: 'open' as const,
};

describe('GameSessionManager', () => {
  it('should start in lobby phase', () => {
    const session = new GameSessionManager(defaultConfig);
    expect(session.currentPhase).toBe('lobby');
  });

  it('should transition from lobby to setup', () => {
    const session = new GameSessionManager(defaultConfig);
    session.addPlayer('p1', 'Alice');
    session.addPlayer('p2', 'Bob');
    session.startSetup();
    expect(session.currentPhase).toBe('setup');
  });

  it('should require at least 2 players to start', () => {
    const session = new GameSessionManager(defaultConfig);
    session.addPlayer('p1', 'Alice');
    expect(() => session.startSetup()).toThrow();
  });

  it('should transition from setup to playing', () => {
    const session = new GameSessionManager(defaultConfig);
    session.addPlayer('p1', 'Alice');
    session.addPlayer('p2', 'Bob');
    session.startSetup();
    session.startPlaying();
    expect(session.currentPhase).toBe('playing');
  });

  it('should track round number', () => {
    const session = new GameSessionManager(defaultConfig);
    expect(session.currentRound).toBe(1);
  });

  it('should expose player list', () => {
    const session = new GameSessionManager(defaultConfig);
    session.addPlayer('p1', 'Alice');
    session.addPlayer('p2', 'Bob');
    expect(session.playerCount).toBe(2);
  });

  it('should expose game config', () => {
    const session = new GameSessionManager(defaultConfig);
    expect(session.config.maxRounds).toBe(3);
  });

  it('should reject invalid transitions', () => {
    const session = new GameSessionManager(defaultConfig);
    expect(() => session.startPlaying()).toThrow();
  });

  it('should advance round counter', () => {
    const session = new GameSessionManager(defaultConfig);
    expect(session.currentRound).toBe(1);
    session.advanceRound();
    expect(session.currentRound).toBe(2);
  });
});
