import type { GamePhase, TurnAction } from '@shared/types/game';
import type { Tank } from '@shared/types/entities';

/** Create a fire action from the current tank state. */
export function createFireAction(tank: Tank): TurnAction {
  if (!tank.selectedWeapon) {
    throw new Error('No weapon selected');
  }
  return {
    playerId: tank.playerId,
    tankId: tank.id,
    weaponType: tank.selectedWeapon.definition.type,
    angle: tank.angle,
    power: tank.power,
  };
}

/** Check if firing is allowed. */
export function canFire(phase: GamePhase, hasFired: boolean): boolean {
  return phase === 'turn' && !hasFired;
}

/** Check if tank movement is allowed. */
export function canMove(tank: Tank, phase: GamePhase, hasFired: boolean): boolean {
  return phase === 'turn' && !hasFired && tank.state === 'alive' && tank.fuel > 0;
}
