import type { Vector2D } from './geometry';
import type { WeaponType } from './weapons';

export type ProjectileState = 'flying' | 'exploding' | 'done';

export interface Projectile {
  readonly id: string;
  readonly weaponType: WeaponType;
  readonly position: Vector2D;
  readonly velocity: Vector2D;
  readonly state: ProjectileState;
  readonly trail: readonly Vector2D[];
  readonly sourcePlayerId: string;
}
