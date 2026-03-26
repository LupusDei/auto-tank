import {
  consumeAmmo,
  getAmmoCount,
  getAvailableWeaponTypes,
} from '@engine/weapons/WeaponInventory';
import { describe, expect, it, vi } from 'vitest';
import { simulateTick, type SimulationState } from '@engine/physics/ProjectileSimulation';
import { applyRoundRewards } from '@engine/economy/RoundRewards';
import { buyWeapon } from '@engine/economy/Shop';
import { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';
import type { Player } from '@shared/types/entities';
import { spawnProjectile } from '@engine/physics/ProjectileManager';
import type { TerrainData } from '@shared/types/terrain';
import type { WeaponDefinition } from '@shared/types/weapons';

const missileDef: WeaponDefinition = {
  type: 'missile',
  name: 'Missile',
  category: 'projectile',
  explosionRadius: 25,
  damage: 35,
  price: 5000,
  affectedByWind: true,
  affectedByGravity: true,
};

function createTerrain(): TerrainData {
  return {
    config: { width: 500, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap: new Array(500).fill(400) as number[],
    destructionMap: new Array(500).fill(false) as boolean[],
  };
}

describe('Buy → Equip → Fire → Damage → Earn Cycle', () => {
  it('should complete a full economy cycle', () => {
    // 1. Player starts with money
    let player: Player = {
      id: 'p1',
      name: 'Alice',
      color: 'red',
      tanks: [],
      money: 10000,
      inventory: [],
      kills: 0,
      deaths: 0,
      isAI: false,
    };

    // 2. Buy weapons in shop (can afford 2 at 5000 each)
    const result = buyWeapon(player, missileDef, 2);
    expect(result).not.toBeNull();
    if (result) {
      player = result;
      expect(player.money).toBe(0);
    }
  });

  it('should buy, fire, and earn rewards', () => {
    let player: Player = {
      id: 'p1',
      name: 'Alice',
      color: 'red',
      tanks: [],
      money: 50000,
      inventory: [],
      kills: 0,
      deaths: 0,
      isAI: false,
    };

    // Buy 3 missiles
    const purchased = buyWeapon(player, missileDef, 3);
    expect(purchased).not.toBeNull();
    if (!purchased) return;
    player = purchased;
    expect(player.money).toBe(35000);
    expect(getAmmoCount(player.inventory, 'missile')).toBe(3);

    // Fire one missile (consume ammo)
    const newInventory = consumeAmmo(player.inventory, 'missile');
    player = { ...player, inventory: newInventory };
    expect(getAmmoCount(player.inventory, 'missile')).toBe(2);

    // Simulate projectile
    const bus = new EventBus();
    const damageHandler = vi.fn();
    bus.on(EventType.TANK_DAMAGED, damageHandler);

    const proj = spawnProjectile({ x: 100, y: 395 }, 5, 30, 'missile', 'p1');
    const terrain = createTerrain();
    const target = {
      id: 't2',
      playerId: 'p2',
      position: { x: 130, y: 400 },
      angle: 45,
      power: 50,
      health: 100,
      maxHealth: 100,
      fuel: 100,
      state: 'alive' as const,
      color: 'blue' as const,
      selectedWeapon: null,
    };

    let simState: SimulationState = {
      projectiles: [proj],
      terrain,
      tanks: [target],
      wind: 0,
      gravity: 9.81,
    };
    for (let i = 0; i < 600; i++) {
      simState = simulateTick(simState, 1 / 60, bus);
      if (simState.projectiles[0]?.state === 'done') break;
    }

    // Earn round rewards
    player = applyRoundRewards(player, { kills: 0, damageDealt: 35, survived: true });
    expect(player.money).toBeGreaterThan(35000);

    // Verify weapon types still available
    const available = getAvailableWeaponTypes(player.inventory);
    expect(available).toContain('missile');
  });
});
