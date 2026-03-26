import type { Player, Tank } from '@shared/types/entities';

export interface WaterState {
  readonly level: number;
  readonly risePerTurn: number;
}

/** Create initial water state. */
export function createWaterState(risePerTurn = 10): WaterState {
  return { level: 0, risePerTurn };
}

/** Raise water level by one turn. */
export function raiseWater(state: WaterState): WaterState {
  return { ...state, level: state.level + state.risePerTurn };
}

/** Check if a y-position is submerged (below water level). */
export function isSubmerged(y: number, canvasHeight: number, waterLevel: number): boolean {
  return y >= canvasHeight - waterLevel;
}

/** Apply drowning damage to submerged tanks. */
export function applyDrowningDamage(
  players: readonly Player[],
  canvasHeight: number,
  waterLevel: number,
  damagePerTick: number,
): Player[] {
  return players.map((player) => ({
    ...player,
    tanks: player.tanks.map((tank): Tank => {
      if (tank.state !== 'alive') return tank;
      if (!isSubmerged(tank.position.y, canvasHeight, waterLevel)) return tank;
      const newHealth = Math.max(0, tank.health - damagePerTick);
      return { ...tank, health: newHealth, state: newHealth <= 0 ? 'destroyed' : tank.state };
    }),
  }));
}
