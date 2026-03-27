import { type CameraState, createCamera, lerpCamera } from '@renderer/Camera';
import {
  createShake,
  getShakeOffset,
  isShakeComplete,
  type ShakeState,
  updateShake,
} from '@renderer/effects/ScreenEffects';
import type { Vector2D } from '@shared/types/geometry';

export interface GameRendererConfig {
  readonly canvasWidth: number;
  readonly canvasHeight: number;
}

interface GameRendererState {
  camera: CameraState;
  shake: ShakeState | null;
}

export interface GameRenderer {
  readonly camera: CameraState;
  updateCamera: (target: Vector2D, dt: number) => void;
  getShake: () => { x: number; y: number };
  triggerShake: (intensity: number) => void;
  isShaking: () => boolean;
}

/**
 * Facade coordinating Camera + ScreenEffects.
 * Pure state management — does not own a canvas or render loop.
 */
export function createGameRenderer(config: GameRendererConfig): GameRenderer {
  const state: GameRendererState = {
    camera: createCamera(config.canvasWidth, config.canvasHeight),
    shake: null,
  };

  return {
    get camera(): CameraState {
      return state.camera;
    },

    updateCamera(target: Vector2D, dt: number): void {
      state.camera = lerpCamera(state.camera, target);
      if (state.shake) {
        state.shake = updateShake(state.shake, dt);
        if (isShakeComplete(state.shake)) {
          state.shake = null;
        }
      }
    },

    getShake(): { x: number; y: number } {
      if (!state.shake) return { x: 0, y: 0 };
      return getShakeOffset(state.shake);
    },

    triggerShake(intensity: number): void {
      state.shake = createShake(intensity);
    },

    isShaking(): boolean {
      return state.shake !== null && !isShakeComplete(state.shake);
    },
  };
}
