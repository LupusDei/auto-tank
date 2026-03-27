import { describe, expect, it } from 'vitest';
import { bootstrap } from '@engine/Bootstrap';
import { GameSession } from '@engine/scene/GameSession';
import { TickLoop } from '@engine/TickLoop';

describe('Full Game Flow Integration', () => {
  it('should bootstrap, create session, and run through scene transitions', () => {
    const { sceneManager } = bootstrap();

    expect(sceneManager.currentSceneId).toBe('main-menu');
    sceneManager.transition('lobby');
    expect(sceneManager.currentSceneId).toBe('lobby');
    sceneManager.transition('game-setup');
    expect(sceneManager.currentSceneId).toBe('game-setup');
    sceneManager.transition('playing');
    expect(sceneManager.currentSceneId).toBe('playing');
    sceneManager.transition('results');
    expect(sceneManager.currentSceneId).toBe('results');
  });

  it('should create a game session with terrain and players', () => {
    const session = new GameSession({
      gameConfig: {
        maxRounds: 3,
        turnTimeSeconds: 30,
        startingMoney: 1000,
        windStrength: 10,
        gravity: 9.81,
        suddenDeathEnabled: false,
        suddenDeathTurns: 20,
        wallMode: 'open' as const,
      },
      terrainConfig: { width: 200, height: 600, seed: 42, roughness: 0.6, theme: 'classic' },
      playerNames: ['Alice', 'Bob'],
    });

    const state = session.gameState;
    expect(state.terrain).not.toBeNull();
    expect(state.players).toHaveLength(2);

    session.startRound();
    session.startTurn();
    expect(state.phase).toBe('setup'); // gameState is a snapshot
    expect(session.gameState.phase).toBe('turn');
  });

  it('should create a tick loop and manually advance', () => {
    let physicsTicks = 0;
    let renderFrames = 0;

    const loop = new TickLoop(
      () => {
        physicsTicks += 1;
      },
      () => {
        renderFrames += 1;
      },
      (): void => {
        /* input poll */
      },
      { physicsRate: 60 },
    );

    // Simulate 1 second
    for (let i = 0; i < 60; i++) {
      loop.tick(1 / 60);
    }

    expect(physicsTicks).toBe(60);
    expect(renderFrames).toBe(60);
  });
});
