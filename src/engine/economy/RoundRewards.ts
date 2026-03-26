import { calculateInterest, calculateRoundReward } from './index';
import type { Player } from '@shared/types/entities';

export interface RoundStats {
  readonly kills: number;
  readonly damageDealt: number;
  readonly survived: boolean;
}

/** Calculate total reward for a round (base + kills + damage + survival + interest). */
export function calculateTotalRoundReward(stats: RoundStats, currentMoney: number): number {
  const roundReward = calculateRoundReward(stats.kills, stats.damageDealt, stats.survived);
  const interest = calculateInterest(currentMoney);
  return roundReward + interest;
}

/** Apply round rewards to a player. Returns updated player with new money. */
export function applyRoundRewards(player: Player, stats: RoundStats): Player {
  const reward = calculateTotalRoundReward(stats, player.money);
  return {
    ...player,
    money: player.money + reward,
  };
}

/** Apply rewards to all players based on their round stats. */
export function applyAllRoundRewards(
  players: readonly Player[],
  statsMap: ReadonlyMap<string, RoundStats>,
): Player[] {
  return players.map((player) => {
    const stats = statsMap.get(player.id);
    if (!stats) return player;
    return applyRoundRewards(player, stats);
  });
}
