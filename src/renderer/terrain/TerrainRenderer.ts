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

/** Darken a hex color by a given factor (0 = no change, 1 = black). */
export function darkenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const dr = Math.round(r * (1 - factor));
  const dg = Math.round(g * (1 - factor));
  const db = Math.round(b * (1 - factor));
  return (
    '#' +
    dr.toString(16).padStart(2, '0') +
    dg.toString(16).padStart(2, '0') +
    db.toString(16).padStart(2, '0')
  );
}

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

  // Find min terrain y for gradient top
  let minY = canvasHeight;
  for (const h of heightMap) {
    const y = canvasHeight - (h ?? 0);
    if (y < minY) minY = y;
  }

  // Build terrain path
  ctx.beginPath();
  ctx.moveTo(0, canvasHeight);

  for (let x = 0; x < heightMap.length; x++) {
    const y = canvasHeight - (heightMap[x] ?? 0);
    ctx.lineTo(x, y);
  }

  ctx.lineTo(heightMap.length, canvasHeight);
  ctx.closePath();

  // Vertical gradient fill: highlight at top, fill in middle, dark at bottom
  const gradient = ctx.createLinearGradient(0, minY, 0, canvasHeight);
  gradient.addColorStop(0, colors.highlight);
  gradient.addColorStop(0.4, colors.fill);
  gradient.addColorStop(1, darkenColor(colors.fill, 0.3));
  ctx.fillStyle = gradient;
  ctx.fill();

  // Outline stroke
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

/** Draw theme-specific surface detail along the terrain surface. */
export function renderTerrainDetail(
  ctx: CanvasRenderingContext2D,
  terrain: TerrainData,
  canvasHeight: number,
): void {
  const { heightMap, config } = terrain;
  const theme = config.theme;

  ctx.save();
  ctx.globalAlpha = 0.4;

  const detailStep = 4; // Draw detail every 4 pixels

  for (let x = 0; x < heightMap.length; x += detailStep) {
    const h = heightMap[x] ?? 0;
    const surfaceY = canvasHeight - h;

    // Deterministic pseudo-random based on x and seed
    const hash = ((x * 2654435761 + config.seed * 1597334677) >>> 0) % 1000;

    switch (theme) {
      case 'classic':
        drawGrassBlade(ctx, x, surfaceY, hash);
        break;
      case 'arctic':
        drawSnowCap(ctx, x, surfaceY, hash);
        break;
      case 'desert':
        drawSandRipple(ctx, x, surfaceY, hash);
        break;
      case 'volcanic':
        drawEmberDot(ctx, x, surfaceY, hash);
        break;
      case 'lunar':
        drawCraterDot(ctx, x, surfaceY, hash);
        break;
    }
  }

  ctx.restore();
}

function drawGrassBlade(ctx: CanvasRenderingContext2D, x: number, y: number, hash: number): void {
  const bladeHeight = 2 + (hash % 3); // 2-4px
  ctx.strokeStyle = '#2d5a1a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + (hash % 2 === 0 ? -1 : 1), y - bladeHeight);
  ctx.stroke();
}

function drawSnowCap(ctx: CanvasRenderingContext2D, x: number, y: number, hash: number): void {
  const radius = 2 + (hash % 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y - 1, radius, Math.PI, 0);
  ctx.stroke();
}

function drawSandRipple(ctx: CanvasRenderingContext2D, x: number, y: number, _hash: number): void {
  ctx.strokeStyle = '#b89040';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 2, y - 1);
  ctx.lineTo(x + 2, y - 1);
  ctx.stroke();
}

function drawEmberDot(ctx: CanvasRenderingContext2D, x: number, y: number, hash: number): void {
  const isOrange = hash % 3 === 0;
  ctx.fillStyle = isOrange ? '#ff6600' : '#cc2200';
  ctx.beginPath();
  ctx.arc(x, y - 1, 1, 0, Math.PI * 2);
  ctx.fill();
}

function drawCraterDot(ctx: CanvasRenderingContext2D, x: number, y: number, hash: number): void {
  const radius = 1 + (hash % 2);
  ctx.strokeStyle = '#606060';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(x, y - 1, radius, 0, Math.PI * 2);
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
