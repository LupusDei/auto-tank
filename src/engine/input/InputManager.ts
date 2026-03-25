import type { Vector2D } from '@shared/types/geometry';

/**
 * Manages keyboard and mouse input capture.
 * Provides pure queries for current input state.
 */
export class InputManager {
  private readonly keys = new Set<string>();
  private mouse: Vector2D = { x: 0, y: 0 };
  private element: HTMLElement | null = null;

  private readonly onKeyDown = (e: Event): void => {
    if (e instanceof KeyboardEvent) {
      this.keys.add(e.key);
    }
  };

  private readonly onKeyUp = (e: Event): void => {
    if (e instanceof KeyboardEvent) {
      this.keys.delete(e.key);
    }
  };

  private readonly onMouseMove = (e: Event): void => {
    if (e instanceof MouseEvent) {
      this.mouse = { x: e.clientX, y: e.clientY };
    }
  };

  /** Attach input listeners to a DOM element. */
  attach(element: HTMLElement): void {
    if (this.element) {
      this.detach();
    }
    this.element = element;
    element.addEventListener('keydown', this.onKeyDown);
    element.addEventListener('keyup', this.onKeyUp);
    element.addEventListener('mousemove', this.onMouseMove);
  }

  /** Remove all listeners and clean up. */
  detach(): void {
    if (!this.element) return;
    this.element.removeEventListener('keydown', this.onKeyDown);
    this.element.removeEventListener('keyup', this.onKeyUp);
    this.element.removeEventListener('mousemove', this.onMouseMove);
    this.element = null;
    this.reset();
  }

  /** Check if a key is currently pressed. */
  isKeyDown(key: string): boolean {
    return this.keys.has(key);
  }

  /** Get current mouse position. */
  getMousePosition(): Vector2D {
    return this.mouse;
  }

  /** Clear all tracked input state. */
  reset(): void {
    this.keys.clear();
    this.mouse = { x: 0, y: 0 };
  }
}
