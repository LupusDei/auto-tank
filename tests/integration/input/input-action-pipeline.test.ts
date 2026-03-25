import { adjustAngle, adjustPower, cycleWeapon } from '@engine/input/TankControls';
import { canFire, canMove, createFireAction } from '@engine/input/FiringControls';
import { describe, expect, it } from 'vitest';
import {
  emitProjectileFired,
  emitTankMoved,
  emitWeaponSelected,
} from '@engine/input/InputEventEmitter';
import { simulateTick, type SimulationState } from '@engine/physics/ProjectileSimulation';
import { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';
import { moveTank } from '@engine/physics/TankMovement';
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

function createTank(): Tank {
  return {
    id: 't1',
    playerId: 'p1',
    position: { x: 100, y: 200 },
    angle: 45,
    power: 80,
    health: 100,
    maxHealth: 100,
    fuel: 100,
    state: 'alive',
    color: 'red',
    selectedWeapon: {
      definition: {
        type: 'missile',
        name: 'Missile',
        category: 'projectile',
        explosionRadius: 25,
        damage: 35,
        price: 5000,
        affectedByWind: true,
        affectedByGravity: true,
      },
      quantity: 3,
    },
  };
}

describe('Input → Action → Simulation Pipeline', () => {
  it('should adjust angle, fire, and simulate to impact', () => {
    const bus = new EventBus({ historySize: 500 });
    const terrain = createTerrain(500, 400);
    const tank = createTank();

    // 1. Adjust controls
    const newAngle = adjustAngle(tank.angle, 10);
    expect(newAngle).toBe(55);

    const newPower = adjustPower(tank.power, -10);
    expect(newPower).toBe(70);

    // 2. Check can fire
    expect(canFire('turn', false)).toBe(true);

    // 3. Create fire action
    const updatedTank: Tank = { ...tank, angle: newAngle, power: newPower };
    const action = createFireAction(updatedTank);
    expect(action.angle).toBe(55);
    expect(action.power).toBe(70);

    // 4. Spawn projectile from action
    const proj = spawnProjectile(
      updatedTank.position,
      action.angle,
      action.power,
      action.weaponType,
      action.playerId,
    );

    // 5. Emit fire event
    emitProjectileFired(
      bus,
      proj.id,
      action.tankId,
      action.weaponType,
      proj.position,
      proj.velocity,
    );

    // 6. Simulate to impact
    let state: SimulationState = {
      projectiles: [proj],
      terrain,
      tanks: [],
      wind: 5,
      gravity: 9.81,
    };

    for (let tick = 0; tick < 600; tick++) {
      state = simulateTick(state, 1 / 60, bus);
      if (state.projectiles[0]?.state === 'done') break;
    }

    expect(state.projectiles[0]?.state).toBe('done');

    // Verify event trail
    const history = bus.getHistory();
    const types = history.map((e) => e.type);
    expect(types[0]).toBe(EventType.PROJECTILE_FIRED);
    expect(types).toContain(EventType.EXPLOSION);
  });

  it('should move tank, switch weapon, and emit events', () => {
    const bus = new EventBus({ historySize: 50 });
    const terrain = createTerrain(500, 200);
    const tank = createTank();

    // 1. Check can move
    expect(canMove(tank, 'turn', false)).toBe(true);

    // 2. Move tank
    const moved = moveTank(tank, 1, terrain);
    expect(moved.position.x).toBeGreaterThan(tank.position.x);

    // 3. Emit move event
    emitTankMoved(bus, tank.id, tank.position, moved.position, tank.fuel - moved.fuel);

    // 4. Cycle weapon
    const newWeapon = cycleWeapon(['baby-missile', 'missile', 'nuke'], 'missile', 1);
    expect(newWeapon).toBe('nuke');

    // 5. Emit weapon select
    emitWeaponSelected(bus, tank.id, 'missile', newWeapon);

    // Verify events
    const history = bus.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0]?.type).toBe(EventType.TANK_MOVED);
    expect(history[1]?.type).toBe(EventType.WEAPON_SELECTED);
  });

  it('should block actions after firing', () => {
    const tank = createTank();

    // Before firing: can move and fire
    expect(canFire('turn', false)).toBe(true);
    expect(canMove(tank, 'turn', false)).toBe(true);

    // After firing: cannot move or fire again
    expect(canFire('turn', true)).toBe(false);
    expect(canMove(tank, 'turn', true)).toBe(false);
  });
});
