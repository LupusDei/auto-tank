import type { Vector2D } from '@shared/types/geometry';

export interface CameraState {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
}

const DEFAULT_LERP_SPEED = 0.05;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;

/** Create an initial camera centered on the world. */
export function createCamera(worldWidth: number, worldHeight: number): CameraState {
  return { x: worldWidth / 2, y: worldHeight / 2, zoom: 1 };
}

/** Lerp the camera toward a target position. */
export function lerpCamera(
  current: CameraState,
  target: Vector2D,
  speed = DEFAULT_LERP_SPEED,
): CameraState {
  return {
    x: current.x + (target.x - current.x) * speed,
    y: current.y + (target.y - current.y) * speed,
    zoom: current.zoom,
  };
}

/** Set camera zoom, clamped to [MIN_ZOOM, MAX_ZOOM]. */
export function setZoom(camera: CameraState, zoom: number): CameraState {
  return {
    ...camera,
    zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)),
  };
}

/** Calculate zoom level to fit all given points within the viewport. */
export function zoomToFit(
  points: readonly Vector2D[],
  viewportWidth: number,
  viewportHeight: number,
  padding = 50,
): number {
  if (points.length === 0) return 1;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const contentWidth = maxX - minX + padding * 2;
  const contentHeight = maxY - minY + padding * 2;

  const zoomX = viewportWidth / contentWidth;
  const zoomY = viewportHeight / contentHeight;

  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(zoomX, zoomY)));
}

/** Apply camera transform to the canvas context. */
export function applyCameraTransform(
  ctx: CanvasRenderingContext2D,
  camera: CameraState,
  viewportWidth: number,
  viewportHeight: number,
): void {
  ctx.translate(viewportWidth / 2, viewportHeight / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);
}
