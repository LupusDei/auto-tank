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
    type: 'smoke-tracer',
    name: 'Smoke Tracer',
    category: 'projectile',
    explosionRadius: 0,
    damage: 0,
    price: 0,
    affectedByWind: true,
    affectedByGravity: true,
    tier: 'free',
    description: 'Zero-damage calibration shot with visible trail',
    maxAmmo: 99,
  },
  {
    type: 'roller',
    name: 'Roller',
    category: 'special',
    explosionRadius: 20,
    damage: 30,
    price: 4000,
    affectedByWind: false,
    affectedByGravity: false,
    tier: 'common',
    description: 'Rolls along terrain surface',
    maxAmmo: 5,
  },
  {
    type: 'digger',
    name: 'Digger',
    category: 'terrain',
    explosionRadius: 15,
    damage: 20,
    price: 5000,
    affectedByWind: false,
    affectedByGravity: true,
    tier: 'common',
    description: 'Bores vertically through terrain',
    maxAmmo: 3,
  },
  {
    type: 'air-strike',
    name: 'Air Strike',
    category: 'special',
    explosionRadius: 20,
    damage: 25,
    price: 15000,
    clusterCount: 5,
    affectedByWind: false,
    affectedByGravity: true,
    tier: 'rare',
    description: 'Rain of 5 missiles from above',
    maxAmmo: 2,
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
  {
    type: 'grenade',
    name: 'Grenade',
    category: 'projectile',
    explosionRadius: 35,
    damage: 45,
    price: 8000,
    affectedByWind: true,
    affectedByGravity: true,
    tier: 'common',
    description: 'Bouncing grenade with 3-second fuse',
    maxAmmo: 5,
  },
  {
    type: 'shotgun',
    name: 'Shotgun',
    category: 'beam',
    explosionRadius: 10,
    damage: 25,
    price: 6000,
    affectedByWind: false,
    affectedByGravity: false,
    tier: 'common',
    description: 'Short range hitscan, 2 pellets',
    maxAmmo: 3,
  },
  {
    type: 'fire-punch',
    name: 'Fire Punch',
    category: 'special',
    explosionRadius: 5,
    damage: 30,
    price: 0,
    affectedByWind: false,
    affectedByGravity: false,
    tier: 'free',
    description: 'Close range punch with fire damage',
    maxAmmo: 99,
  },
  {
    type: 'baseball-bat',
    name: 'Baseball Bat',
    category: 'special',
    explosionRadius: 5,
    damage: 15,
    price: 0,
    affectedByWind: false,
    affectedByGravity: false,
    tier: 'free',
    description: 'Weak damage but massive knockback',
    maxAmmo: 99,
  },
  {
    type: 'guided-missile',
    name: 'Guided Missile',
    category: 'special',
    explosionRadius: 30,
    damage: 50,
    price: 20000,
    affectedByWind: false,
    affectedByGravity: false,
    tier: 'epic',
    description: 'Player-controlled flight path',
    maxAmmo: 1,
  },
  {
    type: 'armageddon',
    name: 'Armageddon',
    category: 'special',
    explosionRadius: 25,
    damage: 30,
    price: 80000,
    affectedByWind: false,
    affectedByGravity: true,
    tier: 'legendary',
    description: '20 random meteors from the sky',
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
