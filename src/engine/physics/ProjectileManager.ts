import type { Projectile } from '@shared/types/projectile';
import type { Vector2D } from '@shared/types/geometry';
import type { WeaponType } from '@shared/types/weapons';

import { calculateTrajectoryStep } from './index';

const MAX_TRAIL_LENGTH = 200;

let idCounter = 0;

function generateProjectileId(): string {
  idCounter += 1;
  return `proj-${idCounter}-${Date.now()}`;
}

/** Spawn a projectile from a tank's firing position, angle (degrees), and power. */
export function spawnProjectile(
  position: Vector2D,
  angleDegrees: number,
  power: number,
  weaponType: WeaponType,
  sourcePlayerId = 'unknown',
): Projectile {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  const velocity: Vector2D = {
    x: power * Math.cos(angleRadians),
    y: -power * Math.sin(angleRadians),
  };

  return {
    id: generateProjectileId(),
    weaponType,
    position,
    velocity,
    state: 'flying',
    trail: [position],
    sourcePlayerId,
  };
}

/** Update a flying projectile by one physics step. Non-flying projectiles are returned unchanged. */
export function updateProjectile(
  projectile: Projectile,
  wind: number,
  gravity: number,
  dt: number,
): Projectile {
  if (projectile.state !== 'flying') {
    return projectile;
  }

  const { position: newPosition, velocity: newVelocity } = calculateTrajectoryStep(
    projectile.position,
    projectile.velocity,
    wind,
    gravity,
    dt,
  );

  return {
    ...projectile,
    position: newPosition,
    velocity: newVelocity,
    trail: [...projectile.trail, newPosition].slice(-MAX_TRAIL_LENGTH),
  };
}

/** Transition a flying projectile to the exploding state. */
export function explodeProjectile(projectile: Projectile): Projectile {
  if (projectile.state !== 'flying') {
    return projectile;
  }

  return {
    ...projectile,
    state: 'exploding',
  };
}

/** Transition an exploding projectile to the done state. */
export function finishProjectile(projectile: Projectile): Projectile {
  if (projectile.state !== 'exploding') {
    return projectile;
  }

  return {
    ...projectile,
    state: 'done',
  };
}
