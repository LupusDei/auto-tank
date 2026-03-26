import type { Player, Tank } from '@shared/types/entities';

export type SuddenDeathTrigger = 'health_drain' | 'rising_water' | 'nuke_rain';

export interface SuddenDeathConfig {
  readonly enabled: boolean;
  readonly triggerTurn: number;
  readonly triggers: readonly SuddenDeathTrigger[];
  readonly drainPerTurn: number;
  readonly waterRisePerTurn: number;
}

export function createDefaultSuddenDeathConfig(): SuddenDeathConfig {
  return {
    enabled: true,
    triggerTurn: 20,
    triggers: ['health_drain', 'rising_water'],
    drainPerTurn: 5,
    waterRisePerTurn: 10,
  };
}

/** Check if sudden death should activate. */
export function isSuddenDeathTriggered(config: SuddenDeathConfig, currentTurn: number): boolean {
  return config.enabled && currentTurn >= config.triggerTurn;
}

/** Apply health drain to all alive tanks. */
export function applyHealthDrain(players: readonly Player[], drainAmount: number): Player[] {
  return players.map((player) => ({
    ...player,
    tanks: player.tanks.map((tank): Tank => {
      if (tank.state !== 'alive') return tank;
      const newHealth = Math.max(0, tank.health - drainAmount);
      return { ...tank, health: newHealth, state: newHealth <= 0 ? 'destroyed' : tank.state };
    }),
  }));
}

/** Generate random nuke rain positions. */
export function generateNukeRainPositions(
  worldWidth: number,
  count: number,
  seed: number,
): number[] {
  const positions: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    positions.push((s / 0x7fffffff) * worldWidth);
  }
  return positions;
}
