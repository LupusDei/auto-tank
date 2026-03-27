import type { WeaponBehavior, WeaponBehaviorContext, WeaponBehaviorResult } from './WeaponBehavior';
import { getHeightAt } from '@engine/terrain';
import type { Projectile } from '@shared/types/projectile';

const ROLLER_SPEED = 60; // px/s
const ROLLER_MAX_TIME = 3; // seconds
const ROLLER_STEEP_THRESHOLD = 2; // height diff per 1px step
const ROLLER_TANK_HIT_RADIUS = 15;

/** Track elapsed time via accumulated distance at constant speed. */
function getElapsedTime(projectile: Projectile): number {
  // Use trail length as a proxy: each update adds one point
  // We store elapsed time in the trail array length * typical dt
  // Better approach: use velocity.y as a timer storage (roller doesn't use it for physics)
  return projectile.velocity.y;
}

/** Roller follows terrain surface, exploding on steep slopes or tank hits. */
export class RollerBehavior implements WeaponBehavior {
  readonly weaponType = 'roller';

  update(projectile: Projectile, context: WeaponBehaviorContext): WeaponBehaviorResult {
    const { terrain, tanks, dt } = context;
    const direction = projectile.velocity.x >= 0 ? 1 : -1;
    const elapsed = getElapsedTime(projectile);
    const newElapsed = elapsed + dt;

    // Timeout: explode after max time
    if (newElapsed >= ROLLER_MAX_TIME) {
      return { projectile, shouldExplode: true };
    }

    // Move horizontally
    const newX = projectile.position.x + direction * ROLLER_SPEED * dt;

    // Out of bounds check
    if (newX < 0 || newX >= terrain.config.width) {
      return { projectile, shouldExplode: true };
    }

    // Get terrain height at new position
    const currentHeight = getHeightAt(terrain, projectile.position.x);
    const newHeight = getHeightAt(terrain, newX);
    const heightDiff = Math.abs(newHeight - currentHeight);
    const stepSize = Math.abs(newX - projectile.position.x);

    // Check steep slope (normalized to per-pixel)
    if (stepSize > 0 && heightDiff / stepSize > ROLLER_STEEP_THRESHOLD) {
      return { projectile, shouldExplode: true };
    }

    // Snap to terrain surface (canvas Y = config.height - terrainHeight)
    const surfaceY = terrain.config.height - newHeight;

    const movedProjectile: Projectile = {
      ...projectile,
      position: { x: newX, y: surfaceY },
      velocity: { x: projectile.velocity.x, y: newElapsed },
      trail: [...projectile.trail, { x: newX, y: surfaceY }],
    };

    // Check tank collision
    for (const tank of tanks) {
      if (tank.state === 'destroyed') continue;
      const dx = newX - tank.position.x;
      const dy = surfaceY - tank.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= ROLLER_TANK_HIT_RADIUS) {
        return { projectile: movedProjectile, shouldExplode: true };
      }
    }

    return { projectile: movedProjectile, shouldExplode: false };
  }
}
