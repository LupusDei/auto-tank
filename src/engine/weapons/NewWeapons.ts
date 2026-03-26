import type { WeaponDefinition } from '@shared/types/weapons';

export type WeaponTier = 'free' | 'common' | 'rare' | 'epic' | 'legendary';

export interface ExtendedWeaponDef extends WeaponDefinition {
  readonly tier: WeaponTier;
  readonly description: string;
  readonly maxAmmo: number;
}

export const WEAPON_TIERS: Record<
  WeaponTier,
  { color: string; priceMultiplier: number; maxPurchase: number }
> = {
  free: { color: '#888888', priceMultiplier: 0, maxPurchase: 99 },
  common: { color: '#ffffff', priceMultiplier: 1, maxPurchase: 5 },
  rare: { color: '#4488ff', priceMultiplier: 2, maxPurchase: 3 },
  epic: { color: '#aa44ff', priceMultiplier: 4, maxPurchase: 2 },
  legendary: { color: '#ffaa00', priceMultiplier: 8, maxPurchase: 1 },
};

export const NEW_WEAPONS: readonly ExtendedWeaponDef[] = [
  {
    type: 'holy-hand-grenade',
    name: 'Holy Hand Grenade',
    category: 'projectile',
    explosionRadius: 60,
    damage: 80,
    price: 35000,
    affectedByWind: false,
    affectedByGravity: true,
    tier: 'epic',
    description: 'Massive holy explosion with choir sound',
    maxAmmo: 2,
  },
  {
    type: 'banana-bomb',
    name: 'Banana Bomb',
    category: 'cluster',
    explosionRadius: 30,
    damage: 40,
    price: 25000,
    clusterCount: 5,
    affectedByWind: true,
    affectedByGravity: true,
    tier: 'rare',
    description: 'Splits into 5 bouncing bananas on impact',
    maxAmmo: 3,
  },
  {
    type: 'concrete-donkey',
    name: 'Concrete Donkey',
    category: 'special',
    explosionRadius: 25,
    damage: 999,
    price: 100000,
    affectedByWind: false,
    affectedByGravity: true,
    tier: 'legendary',
    description: 'Unstoppable donkey drills through terrain',
    maxAmmo: 1,
  },
  {
    type: 'napalm',
    name: 'Napalm Strike',
    category: 'special',
    explosionRadius: 40,
    damage: 15,
    price: 12000,
    affectedByWind: true,
    affectedByGravity: true,
    tier: 'rare',
    description: 'Rains fire across a wide area',
    maxAmmo: 3,
  },
  {
    type: 'dirt-bomb',
    name: 'Dirt Bomb',
    category: 'terrain',
    explosionRadius: 30,
    damage: 0,
    price: 3000,
    affectedByWind: true,
    affectedByGravity: true,
    tier: 'common',
    description: 'Adds terrain instead of removing it',
    maxAmmo: 5,
  },
  {
    type: 'baby-missile',
    name: 'Baby Missile',
    category: 'projectile',
    explosionRadius: 15,
    damage: 20,
    price: 0,
    affectedByWind: true,
    affectedByGravity: true,
    tier: 'free',
    description: 'Basic missile, unlimited ammo',
    maxAmmo: 99,
  },
  {
    type: 'missile',
    name: 'Missile',
    category: 'projectile',
    explosionRadius: 25,
    damage: 35,
    price: 5000,
    affectedByWind: true,
    affectedByGravity: true,
    tier: 'common',
    description: 'Standard missile with decent damage',
    maxAmmo: 5,
  },
  {
    type: 'nuke',
    name: 'Nuke',
    category: 'projectile',
    explosionRadius: 80,
    damage: 100,
    price: 50000,
    affectedByWind: false,
    affectedByGravity: true,
    tier: 'legendary',
    description: 'Devastating nuclear explosion',
    maxAmmo: 1,
  },
];

/** Get weapon tier info. */
export function getWeaponTier(weapon: ExtendedWeaponDef): (typeof WEAPON_TIERS)[WeaponTier] {
  return WEAPON_TIERS[weapon.tier];
}

/** Get max purchase count for a weapon based on its tier. */
export function getMaxPurchase(tier: WeaponTier): number {
  return WEAPON_TIERS[tier].maxPurchase;
}

/** Get all weapons of a specific tier. */
export function getWeaponsByTier(tier: WeaponTier): ExtendedWeaponDef[] {
  return NEW_WEAPONS.filter((w) => w.tier === tier);
}

/** Get tier color for display. */
export function getTierColor(tier: WeaponTier): string {
  return WEAPON_TIERS[tier].color;
}
