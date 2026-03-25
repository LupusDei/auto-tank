import type { ExplosionResult, WeaponDefinition } from '@shared/types/weapons';
import { WEAPONS } from '@shared/constants/weapons';

export function getWeaponDefinition(type: string): WeaponDefinition | undefined {
  return WEAPONS[type];
}

export function getAllWeapons(): WeaponDefinition[] {
  return Object.values(WEAPONS);
}

export function getWeaponsByCategory(category: string): WeaponDefinition[] {
  return Object.values(WEAPONS).filter((w) => w.category === category);
}

export function calculateExplosion(
  center: { x: number; y: number },
  weapon: WeaponDefinition,
): ExplosionResult {
  return {
    center,
    radius: weapon.explosionRadius,
    damage: weapon.damage,
    craterDepth: Math.round(weapon.explosionRadius * 0.6),
  };
}
