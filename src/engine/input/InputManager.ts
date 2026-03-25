import type { Vector2D } from '@shared/types/geometry';

/**
 * Manages keyboard and mouse input capture.
 * Provides pure queries for current input state.
 */
export class InputManager {
  private readonly keys = new Set<string>();
  private mouse: Vector2D = { x: 0, y: 0 };
  private element: HTMLElement | null = null;

  private readonly onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.key);
  };

  private readonly onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.key);
  };

  private readonly onMouseMove = (e: MouseEvent): void => {
    this.mouse = { x: e.clientX, y: e.clientY };
  };

  /** Attach input listeners to a DOM element. */
  attach(element: HTMLElement): void {
    if (this.element) {
      this.detach();
    }
    this.element = element;
    element.addEventListener('keydown', this.onKeyDown as EventListener);
    element.addEventListener('keyup', this.onKeyUp as EventListener);
    element.addEventListener('mousemove', this.onMouseMove as EventListener);
  }

  /** Remove all listeners and clean up. */
  detach(): void {
    if (!this.element) return;
    this.element.removeEventListener('keydown', this.onKeyDown as EventListener);
    this.element.removeEventListener('keyup', this.onKeyUp as EventListener);
    this.element.removeEventListener('mousemove', this.onMouseMove as EventListener);
    this.element = null;
    this.reset();
  }

  /** Check if a key is currently pressed. */
  isKeyDown(key: string): boolean {
    return this.keys.has(key);
  }

  /** Get current mouse position (returns a copy). */
  getMousePosition(): Vector2D {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  /** Clear all tracked input state. */
  reset(): void {
    this.keys.clear();
    this.mouse = { x: 0, y: 0 };
  }
}
