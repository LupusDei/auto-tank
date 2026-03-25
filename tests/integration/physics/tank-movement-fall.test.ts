import { calculateFallDamage, checkFalling, simulateFall } from '@engine/physics/FallPhysics';
import { describe, expect, it } from 'vitest';
import { moveTank } from '@engine/physics/TankMovement';
import { placeTankOnTerrain } from '@engine/physics/TankPlacement';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';

function createTerrain(heightMap: number[]): TerrainData {
  return {
    config: { width: heightMap.length, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap,
    destructionMap: new Array(heightMap.length).fill(false) as boolean[],
  };
}

function createTank(x: number, y: number): Tank {
  return {
    id: 't1',
    playerId: 'p1',
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

describe('Tank Movement & Fall Physics Integration', () => {
  it('should place tank on terrain, move, and snap to new height', () => {
    const heights = new Array(200).fill(200) as number[];
    // Create a hill at x=100-110
    for (let i = 100; i <= 110; i++) {
      heights[i] = 180;
    }
    const terrain = createTerrain(heights);

    const pos = placeTankOnTerrain(50, terrain);
    const tank = createTank(pos.x, pos.y);
    expect(tank.position.y).toBe(200);

    // Move right toward the hill
    let moved = tank;
    for (let i = 0; i < 30; i++) {
      moved = moveTank(moved, 1, terrain);
    }

    // Tank should have moved and snapped to terrain height
    expect(moved.position.x).toBeGreaterThan(50);
    expect(moved.fuel).toBeLessThan(100);
  });

  it('should detect falling after terrain drops and apply fall damage', () => {
    // Terrain at height 300 (y-down), tank placed on it
    const terrain = createTerrain(new Array(200).fill(300) as number[]);
    const tank = createTank(100, 200); // Tank above terrain (200 < 300 → needs to fall)

    // Tank is above terrain, should fall
    expect(checkFalling(tank, terrain)).toBe(true);

    // Simulate fall until landed
    let falling = { ...tank, state: 'falling' as const };
    const startY = falling.position.y;
    for (let i = 0; i < 200; i++) {
      falling = simulateFall(falling, terrain, 1 / 60) as typeof falling;
      if (!checkFalling(falling, terrain)) break;
    }

    const fallDistance = falling.position.y - startY;
    expect(fallDistance).toBeGreaterThan(0);
    expect(falling.position.y).toBeCloseTo(300, 0);

    // Calculate fall damage
    const damage = calculateFallDamage(fallDistance);
    expect(damage).toBeGreaterThan(0); // 100 unit fall > 20 threshold
  });

  it('should preserve tank fuel across movement steps', () => {
    const terrain = createTerrain(new Array(200).fill(200) as number[]);
    const tank = createTank(100, 200);

    const step1 = moveTank(tank, 1, terrain);
    const step2 = moveTank(step1, 1, terrain);
    const step3 = moveTank(step2, 1, terrain);

    expect(step1.fuel).toBeGreaterThan(step2.fuel);
    expect(step2.fuel).toBeGreaterThan(step3.fuel);
  });
});
