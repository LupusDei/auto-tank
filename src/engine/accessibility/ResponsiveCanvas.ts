export interface CanvasScale {
  readonly scaleX: number;
  readonly scaleY: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly displayWidth: number;
  readonly displayHeight: number;
}

/** Calculate scale to fit game world into screen while maintaining aspect ratio. */
export function calculateCanvasScale(
  gameWidth: number,
  gameHeight: number,
  screenWidth: number,
  screenHeight: number,
): CanvasScale {
  const scaleX = screenWidth / gameWidth;
  const scaleY = screenHeight / gameHeight;
  const scale = Math.min(scaleX, scaleY);

  const displayWidth = gameWidth * scale;
  const displayHeight = gameHeight * scale;
  const offsetX = (screenWidth - displayWidth) / 2;
  const offsetY = (screenHeight - displayHeight) / 2;

  return { scaleX: scale, scaleY: scale, offsetX, offsetY, displayWidth, displayHeight };
}

/** Convert screen coordinates to game world coordinates. */
export function screenToWorld(
  screenX: number,
  screenY: number,
  scale: CanvasScale,
): { x: number; y: number } {
  return {
    x: (screenX - scale.offsetX) / scale.scaleX,
    y: (screenY - scale.offsetY) / scale.scaleY,
  };
}

/** Detect screen orientation. */
export function getOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'landscape';
  return window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait';
}

/** Get recommended game resolution for device. */
export function getRecommendedResolution(
  screenWidth: number,
  screenHeight: number,
): { width: number; height: number } {
  const maxDim = Math.max(screenWidth, screenHeight);
  if (maxDim <= 640) return { width: 640, height: 360 };
  if (maxDim <= 1024) return { width: 960, height: 540 };
  if (maxDim <= 1920) return { width: 1280, height: 720 };
  return { width: 1920, height: 1080 };
}
