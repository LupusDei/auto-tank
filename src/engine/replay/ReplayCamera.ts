import { type CameraState, lerpCamera, setZoom } from '@renderer/Camera';
import type { Vector2D } from '@shared/types/geometry';

export type ReplayCameraMode = 'follow_projectile' | 'follow_tank' | 'zoom_to_impact' | 'overview';

/** Auto-follow a projectile during replay. */
export function followProjectile(
  camera: CameraState,
  position: Vector2D,
  speed = 0.1,
): CameraState {
  return lerpCamera(camera, position, speed);
}

/** Zoom to impact point for dramatic effect. */
export function zoomToImpact(
  camera: CameraState,
  impactPosition: Vector2D,
  elapsed: number,
  duration: number,
): CameraState {
  const progress = Math.min(1, elapsed / duration);
  const targetZoom = 1.5 + progress * 0.5;
  const moved = lerpCamera(camera, impactPosition, 0.15);
  return setZoom(moved, targetZoom);
}

/** Slow-motion multiplier for kill shots. */
export function calculateSlowMoFactor(
  isKillShot: boolean,
  elapsed: number,
  duration: number,
): number {
  if (!isKillShot) return 1;
  const progress = Math.min(1, elapsed / duration);
  // Slow down to 25% speed, then ramp back to normal
  return progress < 0.5 ? 0.25 : 0.25 + (progress - 0.5) * 1.5;
}

/** Get overview camera position that shows the whole battlefield. */
export function getOverviewPosition(worldWidth: number, worldHeight: number): Vector2D {
  return { x: worldWidth / 2, y: worldHeight / 2 };
}
