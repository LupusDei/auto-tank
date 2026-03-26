import type { WeaponCategory, WeaponDefinition, WeaponType } from '@shared/types/weapons';
import { WEAPONS } from '@shared/constants/weapons';

/** Get a weapon definition by type. */
export function getWeapon(type: WeaponType): WeaponDefinition | undefined {
  return WEAPONS[type];
}

/** Get all registered weapons. */
export function getAllWeapons(): WeaponDefinition[] {
  return Object.values(WEAPONS);
}

/** Get weapons filtered by category. */
export function getWeaponsByCategory(category: WeaponCategory): WeaponDefinition[] {
  return Object.values(WEAPONS).filter((w) => w.category === category);
}

/** Get weapons affordable at a given budget. */
export function getAffordableWeapons(budget: number): WeaponDefinition[] {
  return Object.values(WEAPONS).filter((w) => w.price <= budget);
}

/** Get weapon names sorted by price. */
export function getWeaponsSortedByPrice(): WeaponDefinition[] {
  return [...Object.values(WEAPONS)].sort((a, b) => a.price - b.price);
}
