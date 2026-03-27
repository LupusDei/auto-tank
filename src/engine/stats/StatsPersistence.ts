import { createEmptyStats, type PlayerStats } from './StatsTracker';

const STATS_PREFIX = 'auto-tank-stats-';
const ACHIEVEMENTS_PREFIX = 'auto-tank-achievements-';

/** Saves player stats to localStorage */
export function saveStats(key: string, stats: PlayerStats): void {
  try {
    localStorage.setItem(STATS_PREFIX + key, JSON.stringify(stats));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

/** Loads player stats from localStorage, returning null if not found */
export function loadStats(key: string): PlayerStats | null {
  try {
    const raw = localStorage.getItem(STATS_PREFIX + key);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isValidStats(parsed)) return null;

    return parsed;
  } catch {
    return null;
  }
}

/** Saves unlocked achievement IDs to localStorage */
export function saveAchievements(key: string, achievementIds: string[]): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_PREFIX + key, JSON.stringify(achievementIds));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

/** Loads unlocked achievement IDs from localStorage */
export function loadAchievements(key: string): string[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_PREFIX + key);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

/** Type guard to validate a parsed object is a valid PlayerStats shape */
function isValidStats(value: unknown): value is PlayerStats {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }

  const empty = createEmptyStats();
  const obj = value as Record<string, unknown>;

  for (const key of Object.keys(empty)) {
    if (typeof obj[key] !== 'number') return false;
  }

  return true;
}
