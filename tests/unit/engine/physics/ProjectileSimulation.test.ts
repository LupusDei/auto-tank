import { describe, expect, it, vi } from 'vitest';
import { simulateTick, type SimulationState } from '@engine/physics/ProjectileSimulation';
import { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';
import { spawnProjectile } from '@engine/physics/ProjectileManager';
import type { TerrainData } from '@shared/types/terrain';

function createTerrain(width: number, height: number): TerrainData {
  return {
    config: { width, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap: new Array(width).fill(height) as number[],
    destructionMap: new Array(width).fill(false) as boolean[],
  };
}

describe('ProjectileSimulation', () => {
  describe('simulateTick()', () => {
    it('should update flying projectile position', () => {
      const proj = spawnProjectile({ x: 100, y: 50 }, 45, 80, 'missile');
      const terrain = createTerrain(500, 400);
      const bus = new EventBus();

      const state: SimulationState = {
        projectiles: [proj],
        terrain,
        tanks: [],
        wind: 0,
        gravity: 9.81,
      };

      const result = simulateTick(state, 1 / 60, bus);

      expect(result.projectiles).toHaveLength(1);
      expect(result.projectiles[0]?.position.x).not.toBe(proj.position.x);
    });

    it('should detect terrain collision and resolve explosion', () => {
      // Projectile just above terrain
      const proj = spawnProjectile({ x: 100, y: 395 }, 0, 1, 'missile');
      const terrain = createTerrain(500, 400);
      const bus = new EventBus();
      const explosionHandler = vi.fn();
      bus.on(EventType.EXPLOSION, explosionHandler);

      const state: SimulationState = {
        projectiles: [proj],
        terrain,
        tanks: [],
        wind: 0,
        gravity: 9.81,
      };

      const result = simulateTick(state, 1, bus);

      // Projectile should be done or exploding
      const finalProj = result.projectiles[0];
      expect(finalProj?.state === 'exploding' || finalProj?.state === 'done').toBe(true);
      expect(explosionHandler).toHaveBeenCalledTimes(1);
    });

    it('should deform terrain after explosion', () => {
      const proj = spawnProjectile({ x: 100, y: 395 }, 0, 1, 'missile');
      const terrain = createTerrain(500, 400);
      const bus = new EventBus();

      const state: SimulationState = {
        projectiles: [proj],
        terrain,
        tanks: [],
        wind: 0,
        gravity: 9.81,
      };

      const result = simulateTick(state, 1, bus);
      const originalHeight = terrain.heightMap[100] ?? 0;
      const newHeight = result.terrain.heightMap[100] ?? 0;

      expect(newHeight).not.toBe(originalHeight);
    });

    it('should handle empty projectile list', () => {
      const terrain = createTerrain(500, 400);
      const bus = new EventBus();

      const state: SimulationState = {
        projectiles: [],
        terrain,
        tanks: [],
        wind: 0,
        gravity: 9.81,
      };

      const result = simulateTick(state, 1 / 60, bus);
      expect(result.projectiles).toHaveLength(0);
    });

    it('should emit TERRAIN_DEFORMED on collision', () => {
      const proj = spawnProjectile({ x: 100, y: 395 }, 0, 1, 'missile');
      const terrain = createTerrain(500, 400);
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.TERRAIN_DEFORMED, handler);

      const state: SimulationState = {
        projectiles: [proj],
        terrain,
        tanks: [],
        wind: 0,
        gravity: 9.81,
      };

      simulateTick(state, 1, bus);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should emit TANK_DAMAGED with correct sourcePlayerId and newHealth', () => {
      const proj = spawnProjectile({ x: 100, y: 395 }, 0, 1, 'missile', 'player-attacker');
      const terrain = createTerrain(500, 400);
      const bus = new EventBus();
      const damageHandler = vi.fn();
      bus.on(EventType.TANK_DAMAGED, damageHandler);

      const targetTank = {
        id: 'tank-target',
        playerId: 'player-target',
        position: { x: 102, y: 400 },
        angle: 45,
        power: 50,
        health: 80,
        maxHealth: 100,
        fuel: 100,
        state: 'alive' as const,
        color: 'red' as const,
        selectedWeapon: null,
      };

      const state: SimulationState = {
        projectiles: [proj],
        terrain,
        tanks: [targetTank],
        wind: 0,
        gravity: 9.81,
      };

      simulateTick(state, 1, bus);

      expect(damageHandler).toHaveBeenCalledTimes(1);
      const payload = damageHandler.mock.calls[0]?.[0]?.payload;
      expect(payload.sourcePlayerId).toBe('player-attacker');
      expect(payload.newHealth).toBeLessThan(80);
      expect(payload.newHealth).toBeGreaterThanOrEqual(0);
    });

    it('should skip non-flying projectiles without updating them', () => {
      const proj = spawnProjectile({ x: 100, y: 50 }, 45, 80, 'missile');
      const doneProj = { ...proj, state: 'done' as const };
      const terrain = createTerrain(500, 400);
      const bus = new EventBus();

      const state: SimulationState = {
        projectiles: [doneProj],
        terrain,
        tanks: [],
        wind: 0,
        gravity: 9.81,
      };

      const result = simulateTick(state, 1 / 60, bus);
      expect(result.projectiles[0]?.position).toEqual(doneProj.position);
    });
  });
});
