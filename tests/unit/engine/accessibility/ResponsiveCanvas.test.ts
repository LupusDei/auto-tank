import {
  calculateCanvasScale,
  getRecommendedResolution,
  screenToWorld,
} from '@engine/accessibility/ResponsiveCanvas';
import { describe, expect, it } from 'vitest';

describe('ResponsiveCanvas', () => {
  it('should calculate scale for same aspect ratio', () => {
    const scale = calculateCanvasScale(1280, 720, 1280, 720);
    expect(scale.scaleX).toBe(1);
    expect(scale.offsetX).toBe(0);
  });

  it('should letterbox when screen is wider', () => {
    const scale = calculateCanvasScale(1280, 720, 1920, 720);
    expect(scale.scaleX).toBe(1);
    expect(scale.offsetX).toBeGreaterThan(0);
  });

  it('should pillarbox when screen is taller', () => {
    const scale = calculateCanvasScale(1280, 720, 1280, 1080);
    expect(scale.scaleY).toBe(1);
    expect(scale.offsetY).toBeGreaterThan(0);
  });

  it('should convert screen to world coords', () => {
    const scale = calculateCanvasScale(1280, 720, 1280, 720);
    const world = screenToWorld(640, 360, scale);
    expect(world.x).toBeCloseTo(640);
    expect(world.y).toBeCloseTo(360);
  });

  it('should recommend appropriate resolution', () => {
    expect(getRecommendedResolution(1920, 1080).width).toBe(1280);
    expect(getRecommendedResolution(640, 480).width).toBe(640);
    expect(getRecommendedResolution(1024, 768).width).toBe(960);
  });
});
