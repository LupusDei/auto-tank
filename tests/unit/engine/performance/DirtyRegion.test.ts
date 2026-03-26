import { describe, expect, it } from 'vitest';
import { DirtyRegionTracker } from '@engine/performance/DirtyRegion';

describe('DirtyRegionTracker', () => {
  it('should start with full redraw needed', () => {
    expect(new DirtyRegionTracker().needsFullRedraw()).toBe(true);
  });

  it('should track dirty regions', () => {
    const tracker = new DirtyRegionTracker();
    tracker.clear();
    tracker.markDirty(10, 20, 100, 50);
    expect(tracker.dirtyCount).toBe(1);
  });

  it('should clear all flags', () => {
    const tracker = new DirtyRegionTracker();
    tracker.markDirty(0, 0, 100, 100);
    tracker.clear();
    expect(tracker.dirtyCount).toBe(0);
    expect(tracker.needsFullRedraw()).toBe(false);
  });

  it('should optimize into single bounding rect', () => {
    const tracker = new DirtyRegionTracker();
    tracker.clear();
    tracker.markDirty(0, 0, 50, 50);
    tracker.markDirty(100, 100, 50, 50);
    tracker.optimize();
    expect(tracker.dirtyCount).toBe(1);
    const region = tracker.getDirtyRegions()[0];
    expect(region?.width).toBe(150);
    expect(region?.height).toBe(150);
  });
});
