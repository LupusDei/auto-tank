import {
  applyDrowningDamage,
  createWaterState,
  isSubmerged,
  raiseWater,
} from '@engine/gamemode/WaterSystem';
import { describe, expect, it } from 'vitest';
import type { Player } from '@shared/types/entities';

function createPlayer(y: number, health: number): Player {
  return {
    id: 'p1',
    name: 'A',
    color: 'red',
    tanks: [
      {
        id: 't1',
        playerId: 'p1',
        position: { x: 100, y },
        angle: 45,
        power: 50,
        health,
        maxHealth: 100,
        fuel: 100,
        state: 'alive',
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

describe('WaterSystem', () => {
  it('should create water at level 0', () => {
    expect(createWaterState().level).toBe(0);
  });

  it('should raise water level', () => {
    const water = raiseWater(createWaterState(10));
    expect(water.level).toBe(10);
  });

  it('should detect submerged positions', () => {
    expect(isSubmerged(580, 600, 50)).toBe(true); // y=580 >= 600-50=550
    expect(isSubmerged(500, 600, 50)).toBe(false); // y=500 < 550
  });

  it('should apply drowning damage', () => {
    const players = [createPlayer(590, 100)]; // submerged at water level 50
    const damaged = applyDrowningDamage(players, 600, 50, 10);
    expect(damaged[0]?.tanks[0]?.health).toBe(90);
  });

  it('should not damage tanks above water', () => {
    const players = [createPlayer(400, 100)];
    const result = applyDrowningDamage(players, 600, 50, 10);
    expect(result[0]?.tanks[0]?.health).toBe(100);
  });
});
