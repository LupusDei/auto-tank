import { describe, expect, it } from 'vitest';

import { ACHIEVEMENTS, checkAchievements } from '@engine/stats/Achievements';
import { createEmptyStats, type PlayerStats } from '@engine/stats/StatsTracker';

function makeStats(overrides: Partial<PlayerStats> = {}): PlayerStats {
  return { ...createEmptyStats(), ...overrides };
}

describe('Achievements', () => {
  describe('ACHIEVEMENTS', () => {
    it('should have unique IDs', () => {
      const ids = ACHIEVEMENTS.map((a) => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have 8 defined achievements', () => {
      expect(ACHIEVEMENTS).toHaveLength(8);
    });
  });

  describe('checkAchievements', () => {
    it('should return no achievements for empty stats', () => {
      const result = checkAchievements(createEmptyStats(), new Set());
      expect(result).toEqual([]);
    });

    it('should unlock First Blood when kills >= 1', () => {
      const stats = makeStats({ kills: 1 });
      const result = checkAchievements(stats, new Set());
      const ids = result.map((a) => a.id);
      expect(ids).toContain('first-blood');
    });

    it('should not return already-unlocked achievements', () => {
      const stats = makeStats({ kills: 5 });
      const unlocked = new Set(['first-blood']);
      const result = checkAchievements(stats, unlocked);
      const ids = result.map((a) => a.id);
      expect(ids).not.toContain('first-blood');
    });

    it('should unlock Overkill when maxDamageInOneShot >= 80', () => {
      const stats = makeStats({ maxDamageInOneShot: 80 });
      const result = checkAchievements(stats, new Set());
      const ids = result.map((a) => a.id);
      expect(ids).toContain('overkill');
    });

    it('should unlock Marksman when accuracy >= 70% with 10+ shots', () => {
      const stats = makeStats({ shotsFired: 10, directHits: 8 });
      const result = checkAchievements(stats, new Set());
      const ids = result.map((a) => a.id);
      expect(ids).toContain('marksman');
    });

    it('should not unlock Marksman with fewer than 10 shots', () => {
      const stats = makeStats({ shotsFired: 5, directHits: 5 });
      const result = checkAchievements(stats, new Set());
      const ids = result.map((a) => a.id);
      expect(ids).not.toContain('marksman');
    });

    it('should unlock Untouchable only with gamesWon >= 1 AND deaths === 0', () => {
      const noWin = makeStats({ gamesWon: 0, deaths: 0 });
      expect(checkAchievements(noWin, new Set()).map((a) => a.id)).not.toContain('untouchable');

      const hasDeath = makeStats({ gamesWon: 1, deaths: 1 });
      expect(checkAchievements(hasDeath, new Set()).map((a) => a.id)).not.toContain('untouchable');

      const perfect = makeStats({ gamesWon: 1, deaths: 0 });
      expect(checkAchievements(perfect, new Set()).map((a) => a.id)).toContain('untouchable');
    });

    it('should unlock multiple achievements at once', () => {
      const stats = makeStats({
        kills: 3,
        totalDamageDealt: 600,
        shotsFired: 55,
        directHits: 40,
        maxDamageInOneShot: 90,
        roundsWon: 4,
      });
      const result = checkAchievements(stats, new Set());
      const ids = result.map((a) => a.id);
      expect(ids).toContain('first-blood');
      expect(ids).toContain('sniper');
      expect(ids).toContain('overkill');
      expect(ids).toContain('artillery-expert');
      expect(ids).toContain('demolition-man');
      expect(ids).toContain('survivor');
      expect(ids).toContain('marksman');
    });
  });
});
