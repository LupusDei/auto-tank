import type { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';
import type { Vector2D } from '@shared/types/geometry';
import type { WeaponType } from '@shared/types/weapons';

/** Emit WEAPON_SELECTED event when player switches weapon. */
export function emitWeaponSelected(
  bus: EventBus,
  tankId: string,
  previousWeapon: WeaponType | null,
  newWeapon: WeaponType,
): void {
  bus.emit(EventType.WEAPON_SELECTED, { tankId, previousWeapon, newWeapon });
}

/** Emit TANK_MOVED event when player moves tank. */
export function emitTankMoved(
  bus: EventBus,
  tankId: string,
  previousPosition: Vector2D,
  newPosition: Vector2D,
  fuelUsed: number,
): void {
  bus.emit(EventType.TANK_MOVED, {
    tankId,
    previousPosition,
    newPosition,
    fuelUsed,
  });
}

/** Emit PROJECTILE_FIRED event when player fires. */
export function emitProjectileFired(
  bus: EventBus,
  projectileId: string,
  tankId: string,
  weaponType: WeaponType,
  position: Vector2D,
  velocity: Vector2D,
): void {
  bus.emit(EventType.PROJECTILE_FIRED, {
    projectileId,
    tankId,
    weaponType,
    position,
    velocity,
  });
}
