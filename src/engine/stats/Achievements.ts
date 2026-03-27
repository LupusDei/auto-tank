import type { PlayerStats } from './StatsTracker';

/** Definition of an unlockable achievement */
export interface Achievement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly check: (stats: PlayerStats) => boolean;
}

/** All available achievements in the game */
export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Score your first kill',
    icon: '\u{1F5E1}\uFE0F',
    check: (stats) => stats.kills >= 1,
  },
  {
    id: 'sniper',
    name: 'Sniper',
    description: 'Land 5 direct hits',
    icon: '\u{1F3AF}',
    check: (stats) => stats.directHits >= 5,
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Win a game without dying',
    icon: '\u{1F6E1}\uFE0F',
    check: (stats) => stats.gamesWon >= 1 && stats.deaths === 0,
  },
  {
    id: 'overkill',
    name: 'Overkill',
    description: 'Deal 80+ damage in a single shot',
    icon: '\u{1F480}',
    check: (stats) => stats.maxDamageInOneShot >= 80,
  },
  {
    id: 'artillery-expert',
    name: 'Artillery Expert',
    description: 'Fire 50 shots',
    icon: '\u{1F396}\uFE0F',
    check: (stats) => stats.shotsFired >= 50,
  },
  {
    id: 'demolition-man',
    name: 'Demolition Man',
    description: 'Deal 500 total damage',
    icon: '\u{1F4A3}',
    check: (stats) => stats.totalDamageDealt >= 500,
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Win 3 rounds',
    icon: '\u{1F3C6}',
    check: (stats) => stats.roundsWon >= 3,
  },
  {
    id: 'marksman',
    name: 'Marksman',
    description: 'Maintain 70%+ hit accuracy over 10+ shots',
    icon: '\u{1F3F9}',
    check: (stats) => stats.shotsFired >= 10 && stats.directHits / stats.shotsFired >= 0.7,
  },
] as const;

/**
 * Checks which new achievements a player has earned.
 * Returns only achievements not already in the `unlocked` set.
 */
export function checkAchievements(stats: PlayerStats, unlocked: Set<string>): Achievement[] {
  return ACHIEVEMENTS.filter(
    (achievement) => !unlocked.has(achievement.id) && achievement.check(stats),
  );
}
