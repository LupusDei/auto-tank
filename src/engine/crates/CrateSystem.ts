import { getHeightAt } from '@engine/terrain/index';
import type { TerrainData } from '@shared/types/terrain';
import type { Vector2D } from '@shared/types/geometry';
import type { WeaponType } from '@shared/types/weapons';

export type CrateContent =
  | { readonly type: 'weapon'; readonly weaponType: WeaponType; readonly quantity: number }
  | { readonly type: 'health'; readonly amount: number }
  | { readonly type: 'money'; readonly amount: number };

export interface Crate {
  readonly id: string;
  readonly position: Vector2D;
  readonly content: CrateContent;
  readonly state: 'falling' | 'landed' | 'collected';
  readonly fallSpeed: number;
}

const DEFAULT_SPAWN_CHANCE = 0.3;
const FALL_SPEED = 40;
const COMMON_WEAPONS: readonly WeaponType[] = [
  'missile',
  'grenade',
  'dirt-bomb',
  'roller',
  'digger',
  'shotgun',
];

let crateCounter = 0;

/** Check whether a crate should spawn this turn. Default 30% chance. */
export function shouldSpawnCrate(
  random: () => number,
  chance: number = DEFAULT_SPAWN_CHANCE,
): boolean {
  return random() < chance;
}

/** Generate random crate content using a seeded PRNG. */
export function generateCrateContent(random: () => number): CrateContent {
  const roll = random();

  if (roll < 0.4) {
    // 40% weapon
    const weaponIndex = Math.floor(random() * COMMON_WEAPONS.length);
    const weaponType = COMMON_WEAPONS[weaponIndex] ?? 'missile';
    const quantity = 1 + Math.floor(random() * 3);
    return { type: 'weapon', weaponType, quantity };
  }

  if (roll < 0.7) {
    // 30% health (25hp)
    return { type: 'health', amount: 25 };
  }

  // 30% money ($3000)
  return { type: 'money', amount: 3000 };
}

/** Create a crate that starts above the canvas and falls to terrain. */
export function createCrate(
  _x: number,
  _terrainHeight: number,
  canvasWidth: number,
  random: () => number,
): Crate {
  const crateX = random() * canvasWidth;
  const content = generateCrateContent(random);

  crateCounter += 1;
  return {
    id: `crate-${crateCounter}-${Math.floor(crateX)}`,
    position: { x: crateX, y: -30 },
    content,
    state: 'falling',
    fallSpeed: FALL_SPEED,
  };
}

/** Update a crate's position. Returns a new Crate (immutable). */
export function updateCrate(
  crate: Crate,
  terrain: TerrainData,
  _canvasHeight: number,
  dt: number,
): Crate {
  if (crate.state !== 'falling') {
    return crate;
  }

  const newY = crate.position.y + crate.fallSpeed * dt;
  const terrainY = getHeightAt(terrain, crate.position.x);

  // Canvas coordinate system: terrain height from top = config.height - terrainY
  const surfaceY = terrain.config.height - terrainY;

  if (newY >= surfaceY) {
    return {
      ...crate,
      position: { x: crate.position.x, y: surfaceY },
      state: 'landed',
    };
  }

  return {
    ...crate,
    position: { x: crate.position.x, y: newY },
  };
}
