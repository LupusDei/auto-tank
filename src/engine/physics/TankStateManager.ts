import type { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';
import type { Tank } from '@shared/types/entities';

/** Apply damage to a tank, transitioning to destroyed if health drops to 0. */
export function applyDamage(
  tank: Tank,
  damage: number,
  killerPlayerId: string | null,
  bus?: EventBus,
): Tank {
  if (tank.state === 'destroyed') return tank;

  const newHealth = Math.max(0, tank.health - damage);
  const killed = newHealth <= 0;

  if (killed && bus) {
    bus.emit(EventType.TANK_DESTROYED, {
      tankId: tank.id,
      killerPlayerId,
      position: tank.position,
    });
  }

  return {
    ...tank,
    health: newHealth,
    state: killed ? 'destroyed' : tank.state,
  };
}

/** Transition tank to falling state. */
export function startFalling(tank: Tank, bus?: EventBus): Tank {
  if (tank.state !== 'alive') return tank;

  if (bus) {
    bus.emit(EventType.TANK_FALLING, {
      tankId: tank.id,
      startPosition: tank.position,
      fallDistance: 0,
    });
  }

  return { ...tank, state: 'falling' };
}

/** Transition tank from falling to alive (landed). */
export function landTank(tank: Tank, fallDistance: number, bus?: EventBus): Tank {
  if (tank.state !== 'falling') return tank;

  if (bus) {
    bus.emit(EventType.TANK_MOVED, {
      tankId: tank.id,
      previousPosition: { x: tank.position.x, y: tank.position.y - fallDistance },
      newPosition: tank.position,
      fuelUsed: 0,
    });
  }

  return { ...tank, state: 'alive' };
}
