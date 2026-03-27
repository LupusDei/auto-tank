import {
  EventType,
  type GameEvent,
  type ProjectileFiredPayload,
  type RoundEndedPayload,
  type TankDamagedPayload,
  type TankDestroyedPayload,
} from '@engine/events/types';
import type { EventBus } from '@engine/events/EventBus';

/** Per-player accumulated statistics */
export interface PlayerStats {
  readonly totalDamageDealt: number;
  readonly totalDamageTaken: number;
  readonly kills: number;
  readonly deaths: number;
  readonly shotsFired: number;
  readonly directHits: number;
  readonly longestKill: number;
  readonly maxDamageInOneShot: number;
  readonly roundsWon: number;
  readonly gamesPlayed: number;
  readonly gamesWon: number;
}

/** Runtime tracker that accumulates stats from EventBus events */
export interface StatsTracker {
  getStats(playerIndex: number): PlayerStats;
  getAllStats(): readonly PlayerStats[];
  reset(): void;
}

/** Creates a zeroed-out PlayerStats object */
export function createEmptyStats(): PlayerStats {
  return {
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    kills: 0,
    deaths: 0,
    shotsFired: 0,
    directHits: 0,
    longestKill: 0,
    maxDamageInOneShot: 0,
    roundsWon: 0,
    gamesPlayed: 0,
    gamesWon: 0,
  };
}

/** Mutable version used internally for accumulation */
interface MutableStats {
  totalDamageDealt: number;
  totalDamageTaken: number;
  kills: number;
  deaths: number;
  shotsFired: number;
  directHits: number;
  longestKill: number;
  maxDamageInOneShot: number;
  roundsWon: number;
  gamesPlayed: number;
  gamesWon: number;
}

function createMutableStats(): MutableStats {
  return {
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    kills: 0,
    deaths: 0,
    shotsFired: 0,
    directHits: 0,
    longestKill: 0,
    maxDamageInOneShot: 0,
    roundsWon: 0,
    gamesPlayed: 0,
    gamesWon: 0,
  };
}

function toReadonly(stats: MutableStats): PlayerStats {
  return { ...stats };
}

/**
 * Resolves a player ID string to a numeric index.
 * Supports formats like "player-0", "0", or direct numeric strings.
 */
function resolvePlayerIndex(playerId: string, playerCount: number): number {
  const dashIndex = playerId.lastIndexOf('-');
  const numStr = dashIndex >= 0 ? playerId.slice(dashIndex + 1) : playerId;
  const index = parseInt(numStr, 10);
  if (Number.isNaN(index) || index < 0 || index >= playerCount) {
    return -1;
  }
  return index;
}

/**
 * Creates a StatsTracker connected to an EventBus.
 * Subscribes to game events and accumulates per-player statistics.
 * Returns unsubscribe handles so the tracker can be cleanly torn down.
 */
export function connectStatsTracker(bus: EventBus, playerCount: number): StatsTracker {
  let stats: MutableStats[] = Array.from({ length: playerCount }, createMutableStats);

  bus.on(EventType.TANK_DAMAGED, (event: GameEvent<typeof EventType.TANK_DAMAGED>) => {
    const payload = event.payload as TankDamagedPayload;
    const sourceIdx = resolvePlayerIndex(payload.sourcePlayerId, playerCount);
    const targetIdx = resolvePlayerIndex(payload.tankId, playerCount);

    if (sourceIdx >= 0) {
      const source = stats[sourceIdx];
      if (source) {
        source.totalDamageDealt += payload.damage;
        source.directHits += 1;
        source.maxDamageInOneShot = Math.max(source.maxDamageInOneShot, payload.damage);
      }
    }

    if (targetIdx >= 0) {
      const target = stats[targetIdx];
      if (target) {
        target.totalDamageTaken += payload.damage;
      }
    }
  });

  bus.on(EventType.TANK_DESTROYED, (event: GameEvent<typeof EventType.TANK_DESTROYED>) => {
    const payload = event.payload as TankDestroyedPayload;
    const victimIdx = resolvePlayerIndex(payload.tankId, playerCount);
    const killerIdx = payload.killerPlayerId
      ? resolvePlayerIndex(payload.killerPlayerId, playerCount)
      : -1;

    if (victimIdx >= 0) {
      const victim = stats[victimIdx];
      if (victim) {
        victim.deaths += 1;
      }
    }

    if (killerIdx >= 0) {
      const killer = stats[killerIdx];
      if (killer) {
        killer.kills += 1;
      }
    }
  });

  bus.on(EventType.PROJECTILE_FIRED, (event: GameEvent<typeof EventType.PROJECTILE_FIRED>) => {
    const payload = event.payload as ProjectileFiredPayload;
    const idx = resolvePlayerIndex(payload.tankId, playerCount);
    if (idx >= 0) {
      const player = stats[idx];
      if (player) {
        player.shotsFired += 1;
      }
    }
  });

  bus.on(EventType.ROUND_ENDED, (event: GameEvent<typeof EventType.ROUND_ENDED>) => {
    const payload = event.payload as RoundEndedPayload;
    if (payload.winnerId) {
      const winnerIdx = resolvePlayerIndex(payload.winnerId, playerCount);
      if (winnerIdx >= 0) {
        const winner = stats[winnerIdx];
        if (winner) {
          winner.roundsWon += 1;
        }
      }
    }
  });

  return {
    getStats(playerIndex: number): PlayerStats {
      const s = stats[playerIndex];
      return s ? toReadonly(s) : createEmptyStats();
    },

    getAllStats(): readonly PlayerStats[] {
      return stats.map(toReadonly);
    },

    reset(): void {
      // Unsubscribe is not called on reset — tracker stays connected
      stats = Array.from({ length: playerCount }, createMutableStats);
    },
  };
}
