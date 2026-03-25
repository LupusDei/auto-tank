import type { TerrainData, TerrainTheme } from '@shared/types/terrain';

export interface TerrainColors {
  readonly fill: string;
  readonly stroke: string;
  readonly highlight: string;
}

const THEME_COLORS: Record<TerrainTheme, TerrainColors> = {
  classic: { fill: '#4a7c2e', stroke: '#3a6422', highlight: '#5a9436' },
  desert: { fill: '#c4a35a', stroke: '#a8893e', highlight: '#d4b86a' },
  arctic: { fill: '#d0e0e8', stroke: '#b0c0c8', highlight: '#e0f0f8' },
  volcanic: { fill: '#4a3030', stroke: '#3a2020', highlight: '#6a4040' },
  lunar: { fill: '#808080', stroke: '#606060', highlight: '#a0a0a0' },
};

export function getTerrainColors(theme: TerrainTheme): TerrainColors {
  return THEME_COLORS[theme];
}

export function renderTerrain(
  ctx: CanvasRenderingContext2D,
  terrain: TerrainData,
  canvasHeight: number,
): void {
  const colors = getTerrainColors(terrain.config.theme);
  const heightMap = terrain.heightMap;

  ctx.beginPath();
  ctx.moveTo(0, canvasHeight);

  for (let x = 0; x < heightMap.length; x++) {
    const y = canvasHeight - (heightMap[x] ?? 0);
    ctx.lineTo(x, y);
  }

  ctx.lineTo(heightMap.length, canvasHeight);
  ctx.closePath();

  ctx.fillStyle = colors.fill;
  ctx.fill();

  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < heightMap.length; x++) {
    const y = canvasHeight - (heightMap[x] ?? 0);
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
}

/** Render darkened crater shadows where terrain was deformed. */
export function renderCraterShadows(
  ctx: CanvasRenderingContext2D,
  terrain: TerrainData,
  canvasHeight: number,
): void {
  const { destructionMap, heightMap } = terrain;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';

  let inCrater = false;
  let craterStart = 0;

  for (let x = 0; x <= destructionMap.length; x++) {
    const destroyed = x < destructionMap.length && destructionMap[x];
    if (destroyed && !inCrater) {
      inCrater = true;
      craterStart = x;
    } else if (!destroyed && inCrater) {
      // Draw shadow for this crater segment
      ctx.beginPath();
      ctx.moveTo(craterStart, canvasHeight);
      for (let cx = craterStart; cx < x; cx++) {
        const y = canvasHeight - (heightMap[cx] ?? 0);
        ctx.lineTo(cx, y);
      }
      ctx.lineTo(x, canvasHeight);
      ctx.closePath();
      ctx.fill();
      inCrater = false;
    }
  }
}
