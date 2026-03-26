/** Callback types for the decoupled loop. */
export type PhysicsTickFn = (dt: number) => void;
export type RenderFrameFn = (dt: number, interpolation: number) => void;
export type InputPollFn = () => void;

export interface TickLoopConfig {
  readonly physicsRate?: number;
  readonly inputRate?: number;
}

/**
 * Game loop with decoupled physics, render, and input rates.
 * Physics runs at a fixed rate (default 60 Hz) for determinism.
 * Rendering runs at display refresh rate via requestAnimationFrame.
 * Input polls at a configurable rate (default 60 Hz).
 */
export class TickLoop {
  private animFrameId: number | null = null;
  private lastTime = 0;
  private physicsAccumulator = 0;
  private inputAccumulator = 0;
  private _isRunning = false;
  private _physicsTicks = 0;
  private _renderFrames = 0;

  readonly physicsStep: number;
  readonly inputStep: number;

  private readonly onPhysicsTick: PhysicsTickFn;
  private readonly onRenderFrame: RenderFrameFn;
  private readonly onInputPoll: InputPollFn;

  constructor(
    onPhysicsTick: PhysicsTickFn,
    onRenderFrame: RenderFrameFn,
    onInputPoll: InputPollFn,
    config?: TickLoopConfig,
  ) {
    this.onPhysicsTick = onPhysicsTick;
    this.onRenderFrame = onRenderFrame;
    this.onInputPoll = onInputPoll;
    this.physicsStep = 1 / (config?.physicsRate ?? 60);
    this.inputStep = 1 / (config?.inputRate ?? 60);
  }

  get isRunning(): boolean {
    return this._isRunning;
  }

  get physicsTicks(): number {
    return this._physicsTicks;
  }

  get renderFrames(): number {
    return this._renderFrames;
  }

  start(): void {
    if (this._isRunning) return;
    this._isRunning = true;
    this.lastTime = performance.now();
    this.physicsAccumulator = 0;
    this.inputAccumulator = 0;
    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  stop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this._isRunning = false;
  }

  /** Manually advance one frame (for testing). */
  tick(dt: number): void {
    this.inputAccumulator += dt;
    while (this.inputAccumulator >= this.inputStep) {
      this.onInputPoll();
      this.inputAccumulator -= this.inputStep;
    }

    this.physicsAccumulator += dt;
    while (this.physicsAccumulator >= this.physicsStep) {
      this.onPhysicsTick(this.physicsStep);
      this.physicsAccumulator -= this.physicsStep;
      this._physicsTicks += 1;
    }

    const interpolation = this.physicsAccumulator / this.physicsStep;
    this.onRenderFrame(dt, interpolation);
    this._renderFrames += 1;
  }

  private loop(timestamp: number): void {
    if (!this._isRunning) return;
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;
    this.tick(dt);
    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }
}
