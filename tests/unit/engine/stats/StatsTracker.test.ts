import { describe, expect, it } from 'vitest';

import { connectStatsTracker, createEmptyStats } from '@engine/stats/StatsTracker';
import { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';

describe('StatsTracker', () => {
  describe('createEmptyStats', () => {
    it('should return all zeroes', () => {
      const stats = createEmptyStats();
      expect(stats.totalDamageDealt).toBe(0);
      expect(stats.kills).toBe(0);
      expect(stats.deaths).toBe(0);
      expect(stats.shotsFired).toBe(0);
      expect(stats.directHits).toBe(0);
      expect(stats.longestKill).toBe(0);
      expect(stats.maxDamageInOneShot).toBe(0);
      expect(stats.roundsWon).toBe(0);
      expect(stats.gamesPlayed).toBe(0);
      expect(stats.gamesWon).toBe(0);
    });
  });

  describe('connectStatsTracker', () => {
    function setup(playerCount = 2) {
      const bus = new EventBus();
      const tracker = connectStatsTracker(bus, playerCount);
      return { bus, tracker };
    }

    it('should accumulate damage dealt and taken from TANK_DAMAGED events', () => {
      const { bus, tracker } = setup();

      bus.emit(EventType.TANK_DAMAGED, {
        tankId: 'player-1',
        damage: 25,
        newHealth: 75,
        sourcePlayerId: 'player-0',
      });

      const attacker = tracker.getStats(0);
      const victim = tracker.getStats(1);

      expect(attacker.totalDamageDealt).toBe(25);
      expect(attacker.directHits).toBe(1);
      expect(attacker.maxDamageInOneShot).toBe(25);
      expect(victim.totalDamageTaken).toBe(25);
    });

    it('should track kills and deaths from TANK_DESTROYED events', () => {
      const { bus, tracker } = setup();

      bus.emit(EventType.TANK_DESTROYED, {
        tankId: 'player-1',
        killerPlayerId: 'player-0',
        position: { x: 100, y: 200 },
      });

      expect(tracker.getStats(0).kills).toBe(1);
      expect(tracker.getStats(1).deaths).toBe(1);
    });

    it('should count shots fired from PROJECTILE_FIRED events', () => {
      const { bus, tracker } = setup();

      bus.emit(EventType.PROJECTILE_FIRED, {
        projectileId: 'proj-1',
        tankId: 'player-0',
        weaponType: 'missile',
        position: { x: 50, y: 100 },
        velocity: { x: 10, y: -5 },
      });
      bus.emit(EventType.PROJECTILE_FIRED, {
        projectileId: 'proj-2',
        tankId: 'player-0',
        weaponType: 'missile',
        position: { x: 50, y: 100 },
        velocity: { x: 10, y: -5 },
      });

      expect(tracker.getStats(0).shotsFired).toBe(2);
      expect(tracker.getStats(1).shotsFired).toBe(0);
    });

    it('should track rounds won from ROUND_ENDED events', () => {
      const { bus, tracker } = setup();

      bus.emit(EventType.ROUND_ENDED, {
        roundNumber: 1,
        winnerId: 'player-0',
      });
      bus.emit(EventType.ROUND_ENDED, {
        roundNumber: 2,
        winnerId: 'player-0',
      });

      expect(tracker.getStats(0).roundsWon).toBe(2);
      expect(tracker.getStats(1).roundsWon).toBe(0);
    });

    it('should return empty stats for out-of-range player index', () => {
      const { tracker } = setup(2);
      const outOfRange = tracker.getStats(99);
      expect(outOfRange).toEqual(createEmptyStats());
    });

    it('should reset all stats to zero', () => {
      const { bus, tracker } = setup();

      bus.emit(EventType.TANK_DAMAGED, {
        tankId: 'player-1',
        damage: 30,
        newHealth: 70,
        sourcePlayerId: 'player-0',
      });

      tracker.reset();

      expect(tracker.getStats(0).totalDamageDealt).toBe(0);
      expect(tracker.getStats(1).totalDamageTaken).toBe(0);
    });

    it('should track maxDamageInOneShot as the highest single hit', () => {
      const { bus, tracker } = setup();

      bus.emit(EventType.TANK_DAMAGED, {
        tankId: 'player-1',
        damage: 20,
        newHealth: 80,
        sourcePlayerId: 'player-0',
      });
      bus.emit(EventType.TANK_DAMAGED, {
        tankId: 'player-1',
        damage: 50,
        newHealth: 30,
        sourcePlayerId: 'player-0',
      });
      bus.emit(EventType.TANK_DAMAGED, {
        tankId: 'player-1',
        damage: 10,
        newHealth: 20,
        sourcePlayerId: 'player-0',
      });

      expect(tracker.getStats(0).maxDamageInOneShot).toBe(50);
    });
  });
});
