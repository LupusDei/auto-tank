import { createPRNG } from '@shared/prng';
import type { Vector2D } from '@shared/types/geometry';
import type { WeaponType } from '@shared/types/weapons';

export type CrateType = 'weapon' | 'health' | 'shield' | 'fuel';

export interface Crate {
  readonly id: string;
  readonly type: CrateType;
  readonly position: Vector2D;
  readonly content: CrateContent;
  readonly collected: boolean;
}

export type CrateContent =
  | { readonly kind: 'weapon'; readonly weaponType: WeaponType; readonly quantity: number }
  | { readonly kind: 'health'; readonly amount: number }
  | { readonly kind: 'shield'; readonly shieldType: 'light' | 'heavy' }
  | { readonly kind: 'fuel'; readonly amount: number };

const CRATE_WEIGHTS: Record<CrateType, number> = {
  weapon: 0.4,
  health: 0.3,
  shield: 0.15,
  fuel: 0.15,
};

const WEAPON_POOL: WeaponType[] = ['missile', 'mirv', 'nuke', 'napalm'];

/** Generate a random crate drop. */
export function generateCrate(worldWidth: number, terrainHeight: number, seed: number): Crate {
  const rng = createPRNG(seed);

  const x = 50 + rng() * (worldWidth - 100);
  const type = pickCrateType(rng());
  const content = generateContent(type, rng);

  return {
    id: `crate-${seed}`,
    type,
    position: { x, y: terrainHeight },
    content,
    collected: false,
  };
}

/** Generate multiple crate drops for between-turn supply. */
export function generateCrateDrops(
  count: number,
  worldWidth: number,
  terrainHeight: number,
  baseSeed: number,
): Crate[] {
  return Array.from({ length: count }, (_, i) =>
    generateCrate(worldWidth, terrainHeight, baseSeed + i * 7919),
  );
}

/** Mark a crate as collected. */
export function collectCrate(crate: Crate): Crate {
  return { ...crate, collected: true };
}

/** Check if a tank is close enough to pick up a crate. */
export function canPickup(tankPosition: Vector2D, cratePosition: Vector2D, radius = 20): boolean {
  const dx = tankPosition.x - cratePosition.x;
  const dy = tankPosition.y - cratePosition.y;
  return Math.sqrt(dx * dx + dy * dy) <= radius;
}

function pickCrateType(roll: number): CrateType {
  let cumulative = 0;
  for (const [type, weight] of Object.entries(CRATE_WEIGHTS)) {
    cumulative += weight;
    if (roll < cumulative) return type as CrateType;
  }
  return 'weapon';
}

function generateContent(type: CrateType, rng: () => number): CrateContent {
  switch (type) {
    case 'weapon': {
      const weaponIdx = Math.floor(rng() * WEAPON_POOL.length);
      return {
        kind: 'weapon',
        weaponType: WEAPON_POOL[weaponIdx] ?? 'missile',
        quantity: 1 + Math.floor(rng() * 3),
      };
    }
    case 'health':
      return { kind: 'health', amount: 15 + Math.floor(rng() * 25) };
    case 'shield':
      return { kind: 'shield', shieldType: rng() < 0.7 ? 'light' : 'heavy' };
    case 'fuel':
      return { kind: 'fuel', amount: 20 + Math.floor(rng() * 30) };
  }
}
