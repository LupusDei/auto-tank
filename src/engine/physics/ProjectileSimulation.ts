import {
  createGrenadeState,
  type GrenadeState,
  handleGrenadeTerrain,
  updateGrenade,
} from './GrenadeBehavior';
import { explodeProjectile, finishProjectile, updateProjectile } from './ProjectileManager';
import { getBehavior, hasBehavior } from '@engine/weapons/WeaponBehavior';
import { applyWallBehavior } from './WallBehavior';
import { detectCollision } from './CollisionDetector';
import type { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';
import { getWeaponDefinition } from '@engine/weapons';
import type { Projectile } from '@shared/types/projectile';
import { resolveExplosion } from './ExplosionResolver';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';
import type { WallMode } from '@shared/types/game';
import type { WeaponBehaviorContext } from '@engine/weapons/WeaponBehavior';

export interface SimulationState {
  readonly projectiles: readonly Projectile[];
  readonly terrain: TerrainData;
  readonly tanks: readonly Tank[];
  readonly wind: number;
  readonly gravity: number;
  readonly grenadeStates?: ReadonlyMap<string, GrenadeState>;
  readonly wallMode?: WallMode;
}

/** Compute an approximate terrain surface normal at a given x position. */
function getTerrainNormal(x: number, terrain: TerrainData): { x: number; y: number } {
  const hm = terrain.heightMap;
  if (hm.length === 0) return { x: 0, y: -1 };
  const idx = Math.min(Math.max(0, Math.round(x)), hm.length - 1);
  const left = hm[Math.max(0, idx - 1)] ?? 0;
  const right = hm[Math.min(hm.length - 1, idx + 1)] ?? 0;
  // heightMap stores height from bottom; surface normal points upward
  const dx = 2;
  const dy = right - left;
  const len = Math.sqrt(dx * dx + dy * dy);
  // Normal perpendicular to surface tangent, pointing "up" in canvas coords
  return { x: -dy / len, y: -dx / len };
}

function resolveAndEmitExplosion(
  moved: Projectile,
  collisionPosition: { readonly x: number; readonly y: number },
  terrain: TerrainData,
  tanks: readonly Tank[],
  bus: EventBus,
): TerrainData {
  const weapon = getWeaponDefinition(moved.weaponType);
  if (!weapon) return terrain;

  const resolution = resolveExplosion(collisionPosition, weapon, terrain, tanks);

  bus.emit(EventType.EXPLOSION, {
    position: collisionPosition,
    radius: weapon.explosionRadius,
    damage: weapon.damage,
    weaponType: moved.weaponType,
  });

  bus.emit(EventType.TERRAIN_DEFORMED, {
    position: collisionPosition,
    radius: weapon.explosionRadius,
    craterDepth: Math.round(weapon.explosionRadius * 0.6),
  });

  for (const dmg of resolution.damages) {
    const damagedTank = tanks.find((t) => t.id === dmg.tankId);
    const currentHealth = damagedTank?.health ?? 0;
    bus.emit(EventType.TANK_DAMAGED, {
      tankId: dmg.tankId,
      damage: dmg.damageDealt,
      newHealth: Math.max(0, currentHealth - dmg.damageDealt),
      sourcePlayerId: moved.sourcePlayerId,
    });
  }

  return resolution.terrain;
}

/** Simulate one tick: update positions, check collisions, resolve explosions. */
export function simulateTick(state: SimulationState, dt: number, bus: EventBus): SimulationState {
  let terrain = state.terrain;
  const updatedProjectiles: Projectile[] = [];
  const grenadeStates = new Map(state.grenadeStates ?? []);

  // Update grenade fuse timers first
  for (const [projId, gs] of grenadeStates) {
    const result = updateGrenade(gs, dt);
    grenadeStates.set(projId, result.state);
  }

  for (const proj of state.projectiles) {
    if (proj.state !== 'flying') {
      updatedProjectiles.push(proj);
      continue;
    }

    // Check if grenade fuse expired
    if (proj.weaponType === 'grenade') {
      const gs = grenadeStates.get(proj.id);
      if (gs && gs.fuseTimer <= 0) {
        terrain = resolveAndEmitExplosion(proj, proj.position, terrain, state.tanks, bus);
        grenadeStates.delete(proj.id);
        updatedProjectiles.push(finishProjectile(explodeProjectile(proj)));
        continue;
      }
    }

    // Custom weapon behavior plugin
    if (hasBehavior(proj.weaponType)) {
      const behavior = getBehavior(proj.weaponType);
      if (behavior) {
        // Apply standard physics first so projectiles move (gravity, wind)
        // Skip for behaviors that encode state in velocity (digger boring mode)
        // or manage their own movement (roller)
        const skipPhysics = proj.weaponType === 'roller' || proj.velocity.y <= -9999;
        const physicsApplied = skipPhysics
          ? proj
          : updateProjectile(proj, state.wind, state.gravity, dt);
        const behaviorContext: WeaponBehaviorContext = {
          terrain,
          tanks: state.tanks,
          wind: state.wind,
          gravity: state.gravity,
          dt,
        };
        const result = behavior.update(physicsApplied, behaviorContext);

        // Apply terrain modifications from the behavior
        if (result.terrainModified) {
          terrain = result.terrainModified;
        }

        // Handle spawned child projectiles
        if (result.spawnedProjectiles) {
          for (const child of result.spawnedProjectiles) {
            updatedProjectiles.push(child);
          }
        }

        if (result.shouldExplode) {
          terrain = resolveAndEmitExplosion(
            result.projectile,
            result.projectile.position,
            terrain,
            state.tanks,
            bus,
          );
          updatedProjectiles.push(finishProjectile(explodeProjectile(result.projectile)));
        } else if (result.spawnedProjectiles && result.spawnedProjectiles.length > 0) {
          // Parent spawned children but didn't explode — finish the parent
          updatedProjectiles.push(finishProjectile(explodeProjectile(result.projectile)));
        } else {
          updatedProjectiles.push(result.projectile);
        }
        continue;
      }
    }

    // Update position
    let moved = updateProjectile(proj, state.wind, state.gravity, dt);

    // Apply wall behavior before collision detection
    const wallMode = state.wallMode ?? 'open';
    if (wallMode !== 'open') {
      const wallResult = applyWallBehavior(
        moved.position,
        moved.velocity,
        terrain.config.width,
        wallMode,
      );
      if (wallResult) {
        moved = { ...moved, position: wallResult.position, velocity: wallResult.velocity };
      }
    }

    // Check collision
    const collision = detectCollision(moved, terrain, state.tanks);

    if (collision) {
      // Smoke tracer: no explosion, no damage, no crater — just finish
      if (moved.weaponType === 'smoke-tracer') {
        updatedProjectiles.push(finishProjectile(explodeProjectile(moved)));
      } else if (moved.weaponType === 'grenade' && collision.type === 'terrain') {
        // Grenade terrain bounce logic
        let gs = grenadeStates.get(moved.id);
        if (!gs) {
          gs = createGrenadeState();
          grenadeStates.set(moved.id, gs);
        }

        const normal = getTerrainNormal(collision.position.x, terrain);
        const bounceResult = handleGrenadeTerrain(gs, moved.velocity, normal);
        grenadeStates.set(moved.id, bounceResult.state);

        if (bounceResult.shouldExplode) {
          terrain = resolveAndEmitExplosion(moved, collision.position, terrain, state.tanks, bus);
          grenadeStates.delete(moved.id);
          updatedProjectiles.push(finishProjectile(explodeProjectile(moved)));
        } else {
          // Bounce: update velocity and nudge position above surface
          const bouncedProj: Projectile = {
            ...moved,
            velocity: bounceResult.velocity,
            position: {
              x: collision.position.x + normal.x * 2,
              y: collision.position.y + normal.y * 2,
            },
          };
          updatedProjectiles.push(bouncedProj);
        }
      } else {
        // Standard explosion
        terrain = resolveAndEmitExplosion(moved, collision.position, terrain, state.tanks, bus);
        if (moved.weaponType === 'grenade') {
          grenadeStates.delete(moved.id);
        }
        updatedProjectiles.push(finishProjectile(explodeProjectile(moved)));
      }
    } else {
      // Initialize grenade state on first tick if needed
      if (moved.weaponType === 'grenade' && !grenadeStates.has(moved.id)) {
        grenadeStates.set(moved.id, createGrenadeState());
      }
      updatedProjectiles.push(moved);
    }
  }

  return {
    ...state,
    projectiles: updatedProjectiles,
    terrain,
    grenadeStates,
  };
}
