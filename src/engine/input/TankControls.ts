import { PHYSICS } from '@shared/constants/physics';
import type { WeaponType } from '@shared/types/weapons';

/** Adjust angle by delta, clamping to [MIN_ANGLE, MAX_ANGLE]. */
export function adjustAngle(current: number, delta: number): number {
  return Math.max(PHYSICS.MIN_ANGLE, Math.min(PHYSICS.MAX_ANGLE, current + delta));
}

/** Adjust power by delta, clamping to [MIN_POWER, MAX_POWER]. */
export function adjustPower(current: number, delta: number): number {
  return Math.max(PHYSICS.MIN_POWER, Math.min(PHYSICS.MAX_POWER, current + delta));
}

/** Cycle through available weapons. Direction: 1 = forward, -1 = backward. */
export function cycleWeapon(
  available: readonly WeaponType[],
  current: WeaponType,
  direction: number,
): WeaponType {
  if (available.length === 0) return current;

  const idx = available.indexOf(current);
  if (idx === -1) return available[0] ?? current;

  const nextIdx = (idx + direction + available.length) % available.length;
  return available[nextIdx] ?? current;
}
