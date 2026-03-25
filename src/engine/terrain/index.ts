import type { TerrainConfig, TerrainData } from '@shared/types/terrain';

/**
 * Simple seeded PRNG (mulberry32).
 * Returns a function that produces deterministic floats in [0, 1).
 */
function createPRNG(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate terrain using the midpoint displacement algorithm.
 * Produces a height map of length `config.width` with values between
 * 20% and 80% of `config.height`. The result is fully deterministic
 * for a given seed.
 */
export function generateTerrain(config: TerrainConfig): TerrainData {
  const { width, height, seed, roughness } = config;
  const random = createPRNG(seed);

  const minH = height * 0.2;
  const maxH = height * 0.8;
  const midH = (minH + maxH) / 2;
  const range = maxH - minH;

  // Find the next power of 2 >= width-1 for midpoint displacement
  let size = 1;
  while (size < width - 1) {
    size *= 2;
  }

  const points = new Float64Array(size + 1);

  // Seed endpoints
  points[0] = midH + (random() - 0.5) * range * 0.5;
  points[size] = midH + (random() - 0.5) * range * 0.5;

  // Midpoint displacement
  let step = size;
  let scale = roughness * range * 0.5;

  while (step > 1) {
    const half = step / 2;

    for (let i = half; i < size; i += step) {
      const left = points[i - half] ?? 0;
      const right = points[i + half] ?? 0;
      points[i] = (left + right) / 2 + (random() - 0.5) * scale;
    }

    scale *= 0.5;
    step = half;
  }

  // Sample to the target width and clamp to [minH, maxH]
  const heightMap: number[] = new Array(width);
  for (let x = 0; x < width; x++) {
    const t = (x / (width - 1)) * size;
    const lo = Math.floor(t);
    const hi = Math.min(lo + 1, size);
    const frac = t - lo;
    const interpolated = (points[lo] ?? 0) * (1 - frac) + (points[hi] ?? 0) * frac;
    heightMap[x] = Math.max(minH, Math.min(maxH, interpolated));
  }

  const destructionMap: boolean[] = new Array(width).fill(false) as boolean[];

  return {
    config,
    heightMap,
    destructionMap,
  };
}

/**
 * Create a crater by lowering height values within `radius` of `centerX`.
 * Returns a new TerrainData — the original is not mutated.
 */
export function deformTerrain(
  terrain: TerrainData,
  centerX: number,
  radius: number,
  depth: number,
): TerrainData {
  const newHeightMap = [...terrain.heightMap];
  const newDestructionMap = [...terrain.destructionMap];

  const startX = Math.max(0, Math.ceil(centerX - radius));
  const endX = Math.min(terrain.config.width - 1, Math.floor(centerX + radius));

  for (let x = startX; x <= endX; x++) {
    const dist = Math.abs(x - centerX);
    // Smooth cosine falloff
    const factor = 0.5 * (1 + Math.cos((dist / radius) * Math.PI));
    newHeightMap[x] = (newHeightMap[x] ?? 0) - depth * factor;
    newDestructionMap[x] = true;
  }

  return {
    config: terrain.config,
    heightMap: newHeightMap,
    destructionMap: newDestructionMap,
  };
}

/**
 * Return the interpolated height at a fractional x position.
 * Clamps x to the valid range [0, width-1].
 */
export function getHeightAt(terrain: TerrainData, x: number): number {
  const maxIdx = terrain.config.width - 1;
  const clamped = Math.max(0, Math.min(maxIdx, x));

  const lo = Math.floor(clamped);
  const hi = Math.min(lo + 1, maxIdx);
  const frac = clamped - lo;

  return (terrain.heightMap[lo] ?? 0) * (1 - frac) + (terrain.heightMap[hi] ?? 0) * frac;
}
