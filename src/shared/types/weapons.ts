import type { Vector2D } from './geometry';

export type WeaponCategory = 'projectile' | 'cluster' | 'beam' | 'terrain' | 'special';

export type WeaponType =
  | 'baby-missile'
  | 'missile'
  | 'mirv'
  | 'napalm'
  | 'nuke'
  | 'dirt-bomb'
  | 'digger'
  | 'roller'
  | 'deaths-head'
  | 'funky-bomb'
  | 'holy-hand-grenade'
  | 'banana-bomb'
  | 'concrete-donkey'
  | 'smoke-tracer'
  | 'grenade'
  | 'shotgun'
  | 'fire-punch'
  | 'baseball-bat'
  | 'air-strike';

export interface WeaponDefinition {
  readonly type: WeaponType;
  readonly name: string;
  readonly category: WeaponCategory;
  readonly explosionRadius: number;
  readonly damage: number;
  readonly price: number;
  readonly clusterCount?: number;
  readonly affectedByWind: boolean;
  readonly affectedByGravity: boolean;
}

export interface Weapon {
  readonly definition: WeaponDefinition;
  readonly quantity: number;
}

export interface ExplosionResult {
  readonly center: Vector2D;
  readonly radius: number;
  readonly damage: number;
  readonly craterDepth: number;
}

export interface DamageResult {
  readonly tankId: string;
  readonly damageDealt: number;
  readonly killed: boolean;
  readonly knockback: Vector2D;
}
