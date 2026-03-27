import type { Crate, CrateContent } from '@engine/crates/CrateSystem';
import type { Vector2D } from '@shared/types/geometry';
import type { WeaponType } from '@shared/types/weapons';

const DEFAULT_PICKUP_RADIUS = 30;

export interface CrateCollectionResult {
  readonly money: number;
  readonly health: number;
  readonly weaponAdded?: { readonly type: WeaponType; readonly quantity: number };
}

/** Check if a tank is close enough to pick up a crate. */
export function checkCratePickup(
  tankPosition: Vector2D,
  crate: Crate,
  pickupRadius: number = DEFAULT_PICKUP_RADIUS,
): boolean {
  const dx = tankPosition.x - crate.position.x;
  const dy = tankPosition.y - crate.position.y;
  return Math.sqrt(dx * dx + dy * dy) <= pickupRadius;
}

/** Apply crate content to player state. Returns new values (pure function). */
export function applyCrateContent(
  content: CrateContent,
  playerMoney: number,
  tankHealth: number,
  maxHealth: number,
): CrateCollectionResult {
  switch (content.type) {
    case 'money':
      return {
        money: playerMoney + content.amount,
        health: tankHealth,
      };
    case 'health':
      return {
        money: playerMoney,
        health: Math.min(maxHealth, tankHealth + content.amount),
      };
    case 'weapon':
      return {
        money: playerMoney,
        health: tankHealth,
        weaponAdded: { type: content.weaponType, quantity: content.quantity },
      };
  }
}
