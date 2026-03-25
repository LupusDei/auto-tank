import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InputManager } from '@engine/input/InputManager';

function createMockElement(): HTMLElement {
  const listeners: Record<string, EventListener[]> = {};
  return {
    addEventListener: vi.fn((type: string, listener: EventListener) => {
      listeners[type] = listeners[type] ?? [];
      listeners[type].push(listener);
    }),
    removeEventListener: vi.fn((type: string, listener: EventListener) => {
      const list = listeners[type];
      if (list) {
        const idx = list.indexOf(listener);
        if (idx >= 0) list.splice(idx, 1);
      }
    }),
    dispatchEvent: (event: Event): boolean => {
      const list = listeners[event.type];
      if (list) {
        for (const listener of list) {
          listener(event);
        }
      }
      return true;
    },
  } as unknown as HTMLElement;
}

describe('InputManager', () => {
  let element: HTMLElement;
  let input: InputManager;

  beforeEach(() => {
    element = createMockElement();
    input = new InputManager();
  });

  describe('attach/detach', () => {
    it('should add event listeners on attach', () => {
      input.attach(element);
      expect(element.addEventListener).toHaveBeenCalled();
    });

    it('should remove event listeners on detach', () => {
      input.attach(element);
      input.detach();
      expect(element.removeEventListener).toHaveBeenCalled();
    });

    it('should not attach duplicate listeners', () => {
      input.attach(element);
      input.attach(element);
      // Should detach first then reattach
      expect(element.removeEventListener).toHaveBeenCalled();
    });
  });

  describe('keyboard tracking', () => {
    it('should track key down state', () => {
      input.attach(element);
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

      expect(input.isKeyDown('ArrowLeft')).toBe(true);
    });

    it('should track key up state', () => {
      input.attach(element);
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      element.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));

      expect(input.isKeyDown('ArrowLeft')).toBe(false);
    });

    it('should return false for keys never pressed', () => {
      input.attach(element);
      expect(input.isKeyDown('Space')).toBe(false);
    });

    it('should track multiple keys simultaneously', () => {
      input.attach(element);
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));

      expect(input.isKeyDown('ArrowLeft')).toBe(true);
      expect(input.isKeyDown('ArrowUp')).toBe(true);
    });
  });

  describe('mouse tracking', () => {
    it('should track mouse position', () => {
      input.attach(element);
      element.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 200 }));

      const pos = input.getMousePosition();
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(200);
    });

    it('should default to (0, 0) before any mouse event', () => {
      input.attach(element);
      const pos = input.getMousePosition();
      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
    });
  });

  describe('reset', () => {
    it('should clear all key states', () => {
      input.attach(element);
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      input.reset();

      expect(input.isKeyDown('ArrowLeft')).toBe(false);
    });
  });

  describe('mouse position immutability', () => {
    it('should return a copy, not the internal reference', () => {
      input.attach(element);
      element.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 200 }));

      const pos1 = input.getMousePosition();
      const pos2 = input.getMousePosition();
      expect(pos1).toEqual(pos2);
      expect(pos1).not.toBe(pos2);
    });
  });

  describe('detach without attach', () => {
    it('should not throw when detach called without prior attach', () => {
      expect(() => input.detach()).not.toThrow();
    });
  });
});
