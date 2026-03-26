import type { Weapon, WeaponType } from '@shared/types/weapons';

/** Check if player has ammo for a weapon type. */
export function hasAmmo(inventory: readonly Weapon[], weaponType: WeaponType): boolean {
  const weapon = inventory.find((w) => w.definition.type === weaponType);
  return weapon !== undefined && weapon.quantity > 0;
}

/** Get quantity of a weapon type in inventory. */
export function getAmmoCount(inventory: readonly Weapon[], weaponType: WeaponType): number {
  return inventory.find((w) => w.definition.type === weaponType)?.quantity ?? 0;
}

/** Consume one ammo of a weapon type. Returns new inventory. */
export function consumeAmmo(inventory: readonly Weapon[], weaponType: WeaponType): Weapon[] {
  return inventory.map((w) => {
    if (w.definition.type !== weaponType) return w;
    return { ...w, quantity: Math.max(0, w.quantity - 1) };
  });
}

/** Add ammo to inventory. Creates entry if weapon not present. */
export function addAmmo(
  inventory: readonly Weapon[],
  weaponType: WeaponType,
  quantity: number,
  definition: Weapon['definition'],
): Weapon[] {
  const exists = inventory.some((w) => w.definition.type === weaponType);
  if (exists) {
    return inventory.map((w) => {
      if (w.definition.type !== weaponType) return w;
      return { ...w, quantity: w.quantity + quantity };
    });
  }
  return [...inventory, { definition, quantity }];
}

/** Get all weapon types that have ammo. */
export function getAvailableWeaponTypes(inventory: readonly Weapon[]): WeaponType[] {
  return inventory.filter((w) => w.quantity > 0).map((w) => w.definition.type);
}

/** Get the default weapon (first with ammo). */
export function getDefaultWeapon(inventory: readonly Weapon[]): WeaponType | null {
  const first = inventory.find((w) => w.quantity > 0);
  return first?.definition.type ?? null;
}
