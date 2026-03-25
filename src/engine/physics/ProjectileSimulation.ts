import { explodeProjectile, finishProjectile, updateProjectile } from './ProjectileManager';
import { detectCollision } from './CollisionDetector';
import type { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';
import { getWeaponDefinition } from '@engine/weapons';
import type { Projectile } from '@shared/types/projectile';
import { resolveExplosion } from './ExplosionResolver';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';

export interface SimulationState {
  readonly projectiles: readonly Projectile[];
  readonly terrain: TerrainData;
  readonly tanks: readonly Tank[];
  readonly wind: number;
  readonly gravity: number;
}

/** Simulate one tick: update positions, check collisions, resolve explosions. */
export function simulateTick(state: SimulationState, dt: number, bus: EventBus): SimulationState {
  let terrain = state.terrain;
  const updatedProjectiles: Projectile[] = [];

  for (const proj of state.projectiles) {
    if (proj.state !== 'flying') {
      updatedProjectiles.push(proj);
      continue;
    }

    // Update position
    const moved = updateProjectile(proj, state.wind, state.gravity, dt);

    // Check collision
    const collision = detectCollision(moved, terrain, state.tanks);

    if (collision) {
      // Resolve explosion
      const weapon = getWeaponDefinition(moved.weaponType);
      if (weapon) {
        const resolution = resolveExplosion(collision.position, weapon, terrain, state.tanks);
        terrain = resolution.terrain;

        // Emit events
        bus.emit(EventType.EXPLOSION, {
          position: collision.position,
          radius: weapon.explosionRadius,
          damage: weapon.damage,
          weaponType: moved.weaponType,
        });

        bus.emit(EventType.TERRAIN_DEFORMED, {
          position: collision.position,
          radius: weapon.explosionRadius,
          craterDepth: Math.round(weapon.explosionRadius * 0.6),
        });

        for (const dmg of resolution.damages) {
          bus.emit(EventType.TANK_DAMAGED, {
            tankId: dmg.tankId,
            damage: dmg.damageDealt,
            newHealth: 0, // Caller should compute actual new health
            sourcePlayerId: 'unknown',
          });
        }
      }

      updatedProjectiles.push(finishProjectile(explodeProjectile(moved)));
    } else {
      updatedProjectiles.push(moved);
    }
  }

  return {
    ...state,
    projectiles: updatedProjectiles,
    terrain,
  };
}
