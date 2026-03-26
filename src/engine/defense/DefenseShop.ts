import type { Player } from '@shared/types/entities';
import type { ShieldType } from './ShieldSystem';

export interface DefenseItem {
  readonly type: 'shield' | 'parachute' | 'fuel';
  readonly subtype?: ShieldType;
  readonly name: string;
  readonly price: number;
  readonly description: string;
}

export const DEFENSE_ITEMS: readonly DefenseItem[] = [
  {
    type: 'shield',
    subtype: 'light',
    name: 'Light Shield',
    price: 3000,
    description: 'Absorbs 50% of incoming damage (50 HP capacity)',
  },
  {
    type: 'shield',
    subtype: 'heavy',
    name: 'Heavy Shield',
    price: 8000,
    description: 'Absorbs 80% of incoming damage (100 HP capacity)',
  },
  { type: 'parachute', name: 'Parachute', price: 1000, description: 'Prevents fall damage' },
  { type: 'fuel', name: 'Fuel Canister', price: 2000, description: 'Restores 50 fuel' },
];

/** Get all defense items affordable at budget. */
export function getAffordableDefenses(budget: number): DefenseItem[] {
  return DEFENSE_ITEMS.filter((item) => item.price <= budget);
}

/** Buy a defense item. Returns updated player or null if can't afford. */
export function buyDefenseItem(player: Player, item: DefenseItem): Player | null {
  if (player.money < item.price) return null;
  return { ...player, money: player.money - item.price };
}

/** Get all defense items. */
export function getAllDefenseItems(): readonly DefenseItem[] {
  return DEFENSE_ITEMS;
}
