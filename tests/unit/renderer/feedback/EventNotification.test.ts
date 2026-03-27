import {
  createCrateNotification,
  createSuddenDeathNotification,
  renderEventNotification,
} from '@renderer/feedback/EventNotification';
import { describe, expect, it, vi } from 'vitest';

function createMockContext(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 100 }),
    canvas: { width: 800, height: 600 },
    shadowBlur: 0,
    shadowColor: '',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: '' as CanvasTextAlign,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('EventNotification', () => {
  describe('createCrateNotification', () => {
    it('should create notification for weapon crate', () => {
      const notification = createCrateNotification({
        type: 'weapon',
        weaponType: 'missile',
        quantity: 2,
      });
      expect(notification.text).toContain('Weapon');
      expect(notification.duration).toBeGreaterThan(0);
    });

    it('should create notification for health crate', () => {
      const notification = createCrateNotification({ type: 'health', amount: 25 });
      expect(notification.text).toContain('Health');
    });

    it('should create notification for money crate', () => {
      const notification = createCrateNotification({ type: 'money', amount: 3000 });
      expect(notification.text).toContain('$3000');
    });
  });

  describe('createSuddenDeathNotification', () => {
    it('should create notification with turns remaining', () => {
      const notification = createSuddenDeathNotification(3);
      expect(notification.text).toContain('3');
      expect(notification.color).toBe('#ff0000');
    });
  });

  describe('renderEventNotification', () => {
    it('should render visible notification', () => {
      const ctx = createMockContext();
      const notification = createCrateNotification({ type: 'health', amount: 25 });
      renderEventNotification(ctx, notification, 500);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('should not render when elapsed exceeds duration', () => {
      const ctx = createMockContext();
      const notification = createCrateNotification({ type: 'health', amount: 25 });
      renderEventNotification(ctx, notification, notification.duration + 100);
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });
});
