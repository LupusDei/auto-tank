import {
  applyHealthDrain,
  createDefaultSuddenDeathConfig,
  generateNukeRainPositions,
  isSuddenDeathTriggered,
} from '@engine/gamemode/SuddenDeath';
import { describe, expect, it } from 'vitest';
import type { Player } from '@shared/types/entities';

function createPlayer(health: number): Player {
  return {
    id: 'p1',
    name: 'A',
    color: 'red',
    tanks: [
      {
        id: 't1',
        playerId: 'p1',
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
    money: 0,
    inventory: [],
    kills: 0,
    deaths: 0,
    isAI: false,
  };
}

describe('SuddenDeath', () => {
  it('should trigger at configured turn', () => {
    const cfg = createDefaultSuddenDeathConfig();
    expect(isSuddenDeathTriggered(cfg, 19)).toBe(false);
    expect(isSuddenDeathTriggered(cfg, 20)).toBe(true);
  });

  it('should apply health drain', () => {
    const players = [createPlayer(100), createPlayer(30)];
    const drained = applyHealthDrain(players, 5);
    expect(drained[0]?.tanks[0]?.health).toBe(95);
    expect(drained[1]?.tanks[0]?.health).toBe(25);
  });

  it('should destroy tanks when health reaches 0', () => {
    const players = [createPlayer(3)];
    const drained = applyHealthDrain(players, 5);
    expect(drained[0]?.tanks[0]?.health).toBe(0);
    expect(drained[0]?.tanks[0]?.state).toBe('destroyed');
  });

  it('should generate deterministic nuke positions', () => {
    const p1 = generateNukeRainPositions(500, 3, 42);
    const p2 = generateNukeRainPositions(500, 3, 42);
    expect(p1).toEqual(p2);
    expect(p1).toHaveLength(3);
  });
});
