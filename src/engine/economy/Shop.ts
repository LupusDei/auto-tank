import type { Weapon, WeaponDefinition } from '@shared/types/weapons';
import { addAmmo } from '@engine/weapons/WeaponInventory';
import { canAfford } from './index';
import type { Player } from '@shared/types/entities';

export interface ShopPurchase {
  readonly playerId: string;
  readonly weaponType: WeaponDefinition;
  readonly quantity: number;
}

/** Attempt to buy a weapon for a player. Returns updated player or null if can't afford. */
export function buyWeapon(player: Player, weapon: WeaponDefinition, quantity = 1): Player | null {
  const totalCost = weapon.price * quantity;
  if (!canAfford(player.money, totalCost)) {
    return null;
  }

  const newInventory = addAmmo(player.inventory, weapon.type, quantity, weapon);
  return {
    ...player,
    money: player.money - totalCost,
    inventory: newInventory,
  };
}

/** Process multiple purchases for a player. Stops if any purchase fails. */
export function processPurchases(player: Player, purchases: readonly ShopPurchase[]): Player {
  let current = player;
  for (const purchase of purchases) {
    const result = buyWeapon(current, purchase.weaponType, purchase.quantity);
    if (!result) break;
    current = result;
  }
  return current;
}

/** Get the total value of a player's inventory. */
export function getInventoryValue(inventory: readonly Weapon[]): number {
  return inventory.reduce((sum, w) => sum + w.definition.price * w.quantity, 0);
}
