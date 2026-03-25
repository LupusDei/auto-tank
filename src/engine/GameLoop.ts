export type UpdateCallback = (deltaTime: number) => void;
export type RenderCallback = (ctx: CanvasRenderingContext2D) => void;

export class GameLoop {
  private animationFrameId: number | null = null;
  private lastTimestamp = 0;
  private readonly updateFn: UpdateCallback;
  private readonly renderFn: RenderCallback;
  private ctx: CanvasRenderingContext2D | null = null;
  private _isRunning = false;

  constructor(updateFn: UpdateCallback, renderFn: RenderCallback) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
  }

  get isRunning(): boolean {
    return this._isRunning;
  }

  start(ctx: CanvasRenderingContext2D): void {
    if (this._isRunning) return;
    this.ctx = ctx;
    this._isRunning = true;
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame((ts) => this.loop(ts));
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this._isRunning = false;
  }

  private loop(timestamp: number): void {
    if (!this._isRunning || !this.ctx) return;

    const deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    // Cap delta to prevent spiral of death
    const cappedDelta = Math.min(deltaTime, 0.1);

    this.updateFn(cappedDelta);
    this.renderFn(this.ctx);

    this.animationFrameId = requestAnimationFrame((ts) => this.loop(ts));
  }
}
