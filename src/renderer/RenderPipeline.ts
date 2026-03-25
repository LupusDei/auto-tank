import type { GameState } from '@shared/types/game';

/** Configuration for the render pipeline. */
export interface RenderConfig {
  readonly canvas: HTMLCanvasElement;
  readonly width: number;
  readonly height: number;
}

/** A single render layer that draws to the canvas. */
export interface RenderLayer {
  readonly name: string;
  render(ctx: CanvasRenderingContext2D, state: GameState, dt: number): void;
}

/** Active visual effects (explosions, particles). */
export interface ActiveEffect {
  readonly id: string;
  readonly startTime: number;
  readonly duration: number;
  render(ctx: CanvasRenderingContext2D, elapsed: number): void;
  isComplete(elapsed: number): boolean;
}

/**
 * Orchestrates the rendering pipeline.
 * Draws layers in order: sky → terrain → entities → projectiles → effects → HUD.
 * State-driven: reads GameState, never mutates it.
 */
export class RenderPipeline {
  private readonly layers: RenderLayer[] = [];
  private readonly effects: ActiveEffect[] = [];
  private readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private gameState: GameState | null = null;

  constructor(config: RenderConfig) {
    const ctx = config.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D rendering context');
    this.ctx = ctx;
    this.width = config.width;
    this.height = config.height;
  }

  /** Add a render layer. Layers are drawn in order of addition. */
  addLayer(layer: RenderLayer): void {
    this.layers.push(layer);
  }

  /** Add a temporary visual effect. */
  addEffect(effect: ActiveEffect): void {
    this.effects.push(effect);
  }

  /** Update the game state that renderers read from. */
  updateState(state: GameState): void {
    this.gameState = state;
  }

  /** Render a single frame. */
  renderFrame(dt: number): void {
    if (!this.gameState) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw layers in order
    for (const layer of this.layers) {
      this.ctx.save();
      layer.render(this.ctx, this.gameState, dt);
      this.ctx.restore();
    }

    // Draw and prune effects
    const now = performance.now();
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];
      if (!effect) continue;
      const elapsed = now - effect.startTime;
      if (effect.isComplete(elapsed)) {
        this.effects.splice(i, 1);
      } else {
        this.ctx.save();
        effect.render(this.ctx, elapsed);
        this.ctx.restore();
      }
    }
  }

  /** Start the render loop. */
  start(): void {
    if (this.animationFrameId !== null) return;
    this.lastTime = performance.now();
    const loop = (time: number): void => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;
      this.renderFrame(dt);
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  /** Stop the render loop. */
  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /** Check if the render loop is running. */
  get isRunning(): boolean {
    return this.animationFrameId !== null;
  }

  /** Get the 2D context (for direct access if needed). */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /** Get current effect count. */
  get effectCount(): number {
    return this.effects.length;
  }

  /** Get current layer count. */
  get layerCount(): number {
    return this.layers.length;
  }
}
