/** FPS performance monitor with budget tracking. */
export class FPSBudget {
  private frameTimes: number[] = [];
  private readonly maxSamples: number;
  private readonly targetFPS: number;
  private _lastFrameTime = 0;

  constructor(targetFPS = 60, maxSamples = 120) {
    this.targetFPS = targetFPS;
    this.maxSamples = maxSamples;
  }

  /** Record a frame. Call at the start of each frame. */
  recordFrame(): void {
    const now = performance.now();
    if (this._lastFrameTime > 0) {
      this.frameTimes.push(now - this._lastFrameTime);
      if (this.frameTimes.length > this.maxSamples) {
        this.frameTimes.shift();
      }
    }
    this._lastFrameTime = now;
  }

  /** Get current FPS (average over recent frames). */
  get fps(): number {
    if (this.frameTimes.length === 0) return 0;
    const avgMs = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return avgMs > 0 ? 1000 / avgMs : 0;
  }

  /** Get frame time in ms. */
  get frameTimeMs(): number {
    if (this.frameTimes.length === 0) return 0;
    return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
  }

  /** Check if running below budget. */
  get isBelowBudget(): boolean {
    return this.fps < this.targetFPS * 0.9;
  }

  /** Get budget utilization (0-1, >1 means over budget). */
  get budgetUtilization(): number {
    const targetMs = 1000 / this.targetFPS;
    return this.frameTimeMs / targetMs;
  }

  /** Suggest quality reduction level (0=fine, 1=reduce particles, 2=reduce effects, 3=minimal). */
  get qualityLevel(): number {
    const fps = this.fps;
    if (fps >= this.targetFPS * 0.9) return 0;
    if (fps >= this.targetFPS * 0.7) return 1;
    if (fps >= this.targetFPS * 0.5) return 2;
    return 3;
  }
}
