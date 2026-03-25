import type { Vector2D } from './geometry';
import type { Weapon } from './weapons';

export type TeamColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export type TankState = 'alive' | 'destroyed' | 'falling';

export interface Tank {
  readonly id: string;
  readonly playerId: string;
  readonly position: Vector2D;
  readonly angle: number;
  readonly power: number;
  readonly health: number;
  readonly maxHealth: number;
  readonly fuel: number;
  readonly state: TankState;
  readonly color: TeamColor;
  readonly selectedWeapon: Weapon | null;
}

export interface Player {
  readonly id: string;
  readonly name: string;
  readonly color: TeamColor;
  readonly tanks: readonly Tank[];
  readonly money: number;
  readonly inventory: readonly Weapon[];
  readonly kills: number;
  readonly deaths: number;
  readonly isAI: boolean;
  readonly aiDifficulty?: number;
}
