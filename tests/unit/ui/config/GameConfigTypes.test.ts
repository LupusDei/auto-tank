import {
  addPlayer,
  createDefaultSetup,
  removePlayer,
  updatePlayer,
} from '@ui/config/GameConfigTypes';
import { describe, expect, it } from 'vitest';

describe('GameConfigTypes', () => {
  it('should create default setup with 2 players', () => {
    const setup = createDefaultSetup();
    expect(setup.players).toHaveLength(2);
    expect(setup.players[0]?.isAI).toBe(false);
    expect(setup.players[1]?.isAI).toBe(true);
    expect(setup.rounds).toBe(5);
  });

  it('should add a player with unique color', () => {
    const setup = addPlayer(createDefaultSetup());
    expect(setup.players).toHaveLength(3);
    expect(setup.players[2]?.color).not.toBe(setup.players[0]?.color);
    expect(setup.players[2]?.color).not.toBe(setup.players[1]?.color);
  });

  it('should not exceed 6 players', () => {
    let setup = createDefaultSetup();
    for (let i = 0; i < 10; i++) setup = addPlayer(setup);
    expect(setup.players).toHaveLength(6);
  });

  it('should remove a player', () => {
    const setup = removePlayer(addPlayer(createDefaultSetup()), 2);
    expect(setup.players).toHaveLength(2);
  });

  it('should not go below 2 players', () => {
    const setup = removePlayer(createDefaultSetup(), 0);
    expect(setup.players).toHaveLength(2);
  });

  it('should update a player', () => {
    const setup = updatePlayer(createDefaultSetup(), 0, { name: 'Hero', aiDifficulty: 'expert' });
    expect(setup.players[0]?.name).toBe('Hero');
    expect(setup.players[0]?.aiDifficulty).toBe('expert');
  });
});
