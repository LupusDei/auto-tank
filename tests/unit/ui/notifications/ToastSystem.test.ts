import {
  createToast,
  getToastColor,
  isToastVisible,
  ToastManager,
} from '@ui/notifications/ToastSystem';
import { describe, expect, it } from 'vitest';

describe('ToastSystem', () => {
  it('should create toast', () => {
    const t = createToast('Hello', 'info');
    expect(t.message).toBe('Hello');
    expect(t.type).toBe('info');
  });

  it('should be visible initially', () => {
    expect(isToastVisible(createToast('Hi'))).toBe(true);
  });

  it('should return color for type', () => {
    expect(getToastColor('success')).toBe('#2ecc71');
    expect(getToastColor('error')).toBe('#e74c3c');
    expect(getToastColor('kill')).toBe('#ff4444');
  });

  it('should manage toast queue', () => {
    const mgr = new ToastManager();
    mgr.add('First');
    mgr.add('Second', 'success');
    expect(mgr.getVisible()).toHaveLength(2);
  });

  it('should clear all toasts', () => {
    const mgr = new ToastManager();
    mgr.add('Test');
    mgr.clear();
    expect(mgr.count).toBe(0);
  });
});
