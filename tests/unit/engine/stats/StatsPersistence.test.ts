import { afterEach, describe, expect, it } from 'vitest';

import { createEmptyStats, type PlayerStats } from '@engine/stats/StatsTracker';
import {
  loadAchievements,
  loadStats,
  saveAchievements,
  saveStats,
} from '@engine/stats/StatsPersistence';

function makeStats(overrides: Partial<PlayerStats> = {}): PlayerStats {
  return { ...createEmptyStats(), ...overrides };
}

describe('StatsPersistence', () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe('saveStats / loadStats', () => {
    it('should round-trip player stats through localStorage', () => {
      const stats = makeStats({
        kills: 5,
        totalDamageDealt: 200,
        shotsFired: 30,
      });

      saveStats('player-0', stats);
      const loaded = loadStats('player-0');

      expect(loaded).toEqual(stats);
    });

    it('should return null for a key that does not exist', () => {
      expect(loadStats('nonexistent')).toBeNull();
    });

    it('should return null for corrupted data', () => {
      localStorage.setItem('auto-tank-stats-bad', '{"kills":"not a number"}');
      expect(loadStats('bad')).toBeNull();
    });
  });

  describe('saveAchievements / loadAchievements', () => {
    it('should round-trip achievement IDs through localStorage', () => {
      const ids = ['first-blood', 'sniper', 'overkill'];
      saveAchievements('player-0', ids);
      const loaded = loadAchievements('player-0');
      expect(loaded).toEqual(ids);
    });

    it('should return empty array for missing key', () => {
      expect(loadAchievements('nonexistent')).toEqual([]);
    });

    it('should filter out non-string values from corrupted data', () => {
      localStorage.setItem(
        'auto-tank-achievements-mixed',
        JSON.stringify(['valid', 42, null, 'also-valid']),
      );
      expect(loadAchievements('mixed')).toEqual(['valid', 'also-valid']);
    });
  });
});
