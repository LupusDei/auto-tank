import type { Projectile } from '@shared/types/projectile';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';

export interface WeaponBehaviorContext {
  readonly terrain: TerrainData;
  readonly tanks: readonly Tank[];
  readonly wind: number;
  readonly gravity: number;
  readonly dt: number;
}

export interface WeaponBehaviorResult {
  readonly projectile: Projectile;
  readonly terrainModified?: TerrainData;
  readonly shouldExplode: boolean;
  readonly spawnedProjectiles?: readonly Projectile[];
}

export interface WeaponBehavior {
  readonly weaponType: string;
  update(projectile: Projectile, context: WeaponBehaviorContext): WeaponBehaviorResult;
}

const behaviors = new Map<string, WeaponBehavior>();

/** Register a custom weapon behavior plugin. */
export function registerBehavior(behavior: WeaponBehavior): void {
  behaviors.set(behavior.weaponType, behavior);
}

/** Retrieve a registered behavior for a weapon type. */
export function getBehavior(weaponType: string): WeaponBehavior | undefined {
  return behaviors.get(weaponType);
}

/** Check if a custom behavior exists for a weapon type. */
export function hasBehavior(weaponType: string): boolean {
  return behaviors.has(weaponType);
}

/** Clear all registered behaviors (for testing). */
export function clearBehaviors(): void {
  behaviors.clear();
}
