export interface DirtyRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Track dirty regions for partial canvas re-rendering. */
export class DirtyRegionTracker {
  private regions: DirtyRect[] = [];
  private _fullRedraw = true;

  /** Mark a rectangular area as needing redraw. */
  markDirty(x: number, y: number, width: number, height: number): void {
    this.regions.push({ x, y, width, height });
  }

  /** Mark entire canvas as dirty. */
  markFullRedraw(): void {
    this._fullRedraw = true;
    this.regions = [];
  }

  /** Check if a full redraw is needed. */
  needsFullRedraw(): boolean {
    return this._fullRedraw;
  }

  /** Get merged dirty regions. */
  getDirtyRegions(): readonly DirtyRect[] {
    return this.regions;
  }

  /** Clear all dirty flags after render. */
  clear(): void {
    this._fullRedraw = false;
    this.regions = [];
  }

  /** Merge overlapping regions into fewer larger ones. */
  optimize(): void {
    if (this.regions.length <= 1) return;
    // Simple: merge all into one bounding rect
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const r of this.regions) {
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.width);
      maxY = Math.max(maxY, r.y + r.height);
    }
    this.regions = [{ x: minX, y: minY, width: maxX - minX, height: maxY - minY }];
  }

  get dirtyCount(): number {
    return this.regions.length;
  }
}
