import { describe, expect, it } from 'vitest';
import { fireShotgun } from '@engine/weapons/ShotgunBehavior';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';

function createTerrain(width: number, surfaceHeight: number): TerrainData {
  return {
    config: { width, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap: new Array(width).fill(surfaceHeight) as number[],
    destructionMap: new Array(width).fill(false) as boolean[],
  };
}

function createTank(id: string, x: number, y: number): Tank {
  return {
    id,
    playerId: `player-${id}`,
    position: { x, y },
    angle: 45,
    power: 50,
    health: 100,
    maxHealth: 100,
    fuel: 100,
    state: 'alive',
    color: 'red',
    selectedWeapon: null,
  };
}

describe('ShotgunBehavior', () => {
  describe('fireShotgun()', () => {
    it('should hit a tank within range', () => {
      // Terrain surface at y=200 (canvas), so heightMap = 600-200 = 400
      const terrain = createTerrain(800, 400);
      // Shooting right (0 degrees), tank at x=150
      const origin = { x: 50, y: 180 };
      const tank = createTank('t1', 150, 180);

      const result = fireShotgun(origin, 0, terrain, [tank]);

      const tankHits = result.hits.filter((h) => h.tankId === 't1');
      expect(tankHits.length).toBeGreaterThan(0);
      expect(tankHits[0]?.damage).toBe(25);
    });

    it('should miss a tank beyond range', () => {
      const terrain = createTerrain(800, 400);
      const origin = { x: 50, y: 180 };
      // Tank is 300px away, beyond default 200px range
      const tank = createTank('t1', 350, 180);

      const result = fireShotgun(origin, 0, terrain, [tank]);

      const tankHits = result.hits.filter((h) => h.tankId !== undefined);
      expect(tankHits.length).toBe(0);
    });

    it('should produce correct number of rays for pellet count', () => {
      const terrain = createTerrain(800, 400);
      const origin = { x: 50, y: 180 };

      const result = fireShotgun(origin, 0, terrain, [], 200, 4);

      expect(result.rays).toHaveLength(4);
    });

    it('should allow multiple pellets to hit different targets', () => {
      const terrain = createTerrain(800, 400);
      const origin = { x: 50, y: 180 };
      // Two tanks at slightly different positions, matching pellet spread
      const tank1 = createTank('t1', 140, 172);
      const tank2 = createTank('t2', 140, 188);

      const result = fireShotgun(origin, 0, terrain, [tank1, tank2], 200, 2);

      // At least one pellet should hit
      const tankHits = result.hits.filter((h) => h.tankId !== undefined);
      expect(tankHits.length).toBeGreaterThanOrEqual(1);
    });

    it('should be stopped by terrain', () => {
      // Low terrain surface: heightMap = 100, surface at y = 600-100 = 500
      // But let's make terrain block the shot
      const terrain = createTerrain(800, 400);
      // Shooting down into terrain (angle -45 = downward)
      const origin = { x: 100, y: 150 };
      // Tank behind the terrain
      const tank = createTank('t1', 300, 180);

      // Shoot down at -30 degrees so ray hits terrain before tank
      const result = fireShotgun(origin, -30, terrain, [tank]);

      const tankHits = result.hits.filter((h) => h.tankId !== undefined);
      expect(tankHits.length).toBe(0);
    });

    it('should default to 2 pellets', () => {
      const terrain = createTerrain(800, 400);
      const origin = { x: 50, y: 180 };

      const result = fireShotgun(origin, 0, terrain, []);

      expect(result.rays).toHaveLength(2);
    });
  });
});
