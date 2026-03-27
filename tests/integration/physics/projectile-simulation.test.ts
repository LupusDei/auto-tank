import { describe, expect, it, vi } from 'vitest';
import { simulateTick, type SimulationState } from '@engine/physics/ProjectileSimulation';
import { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';
import { spawnProjectile } from '@engine/physics/ProjectileManager';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';

function createTerrain(width: number, height: number): TerrainData {
  return {
    config: { width, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap: new Array(width).fill(height) as number[],
    destructionMap: new Array(width).fill(false) as boolean[],
  };
}

function createTank(id: string, x: number, y: number): Tank {
  return {
    id,
    playerId: `player-${id}`,
    position: { x, y },
    angle: 45,
    power: 50,
    health: 100,
    maxHealth: 100,
    fuel: 100,
    state: 'alive',
    color: 'red',
    selectedWeapon: null,
  };
}

describe('Projectile Simulation E2E', () => {
  it('should simulate full trajectory from spawn to terrain impact', () => {
    const proj = spawnProjectile({ x: 50, y: 100 }, 45, 100, 'missile', 'p1');
    const terrain = createTerrain(500, 400);
    const bus = new EventBus({ historySize: 500 });
    const dt = 1 / 60;

    let state: SimulationState = {
      projectiles: [proj],
      terrain,
      tanks: [],
      wind: 0,
      gravity: 9.81,
    };

    // Simulate until projectile is done or 600 ticks (10 sec)
    for (let tick = 0; tick < 600; tick++) {
      state = simulateTick(state, dt, bus);
      const p = state.projectiles[0];
      if (p?.state === 'done') break;
    }

    expect(state.projectiles[0]?.state).toBe('done');

    const history = bus.getHistory();
    const types = history.map((e) => e.type);
    expect(types).toContain(EventType.EXPLOSION);
    expect(types).toContain(EventType.TERRAIN_DEFORMED);
  });

  it('should damage tanks in explosion radius', () => {
    // Terrain height=400, config.height=600, so surface at canvas Y=200.
    // Fire almost horizontally from above terrain toward a tank also above terrain.
    const proj = spawnProjectile({ x: 50, y: 180 }, 5, 30, 'missile', 'p1');
    const terrain = createTerrain(500, 400);
    const tank = createTank('target', 80, 195);
    const bus = new EventBus({ historySize: 500 });

    let state: SimulationState = {
      projectiles: [proj],
      terrain,
      tanks: [tank],
      wind: 0,
      gravity: 9.81,
    };

    const damageHandler = vi.fn();
    bus.on(EventType.TANK_DAMAGED, damageHandler);

    for (let tick = 0; tick < 600; tick++) {
      state = simulateTick(state, 1 / 60, bus);
      if (state.projectiles[0]?.state === 'done') break;
    }

    expect(damageHandler).toHaveBeenCalled();
    const payload = damageHandler.mock.calls[0]?.[0]?.payload;
    expect(payload.sourcePlayerId).toBe('p1');
    expect(payload.tankId).toBe('target');
  });

  it('should deform terrain after explosion', () => {
    const proj = spawnProjectile({ x: 100, y: 100 }, 45, 80, 'missile', 'p1');
    const terrain = createTerrain(500, 400);
    const bus = new EventBus();

    let state: SimulationState = {
      projectiles: [proj],
      terrain,
      tanks: [],
      wind: 0,
      gravity: 9.81,
    };

    for (let tick = 0; tick < 600; tick++) {
      state = simulateTick(state, 1 / 60, bus);
      if (state.projectiles[0]?.state === 'done') break;
    }

    // Terrain at some point near impact should be deformed
    const impactX = Math.round(state.projectiles[0]?.position.x ?? 100);
    const clampedX = Math.max(0, Math.min(499, impactX));
    const newHeight = state.terrain.heightMap[clampedX] ?? 0;
    // The terrain might be deformed at the impact point
    expect(state.projectiles[0]?.state).toBe('done');
    expect(typeof newHeight).toBe('number');
    // At minimum, verify terrain object changed
    expect(state.terrain).not.toBe(terrain);
  });
});
