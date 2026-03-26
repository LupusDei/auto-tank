import { describe, expect, it } from 'vitest';
import { ObjectPool } from '@engine/performance/ObjectPool';

describe('ObjectPool', () => {
  it('should acquire and release objects', () => {
    const pool = new ObjectPool(
      () => ({ value: 0 }),
      (obj): void => {
        obj.value = 0;
      },
    );
    const obj = pool.acquire();
    expect(obj.value).toBe(0);
    pool.release(obj);
    expect(pool.available).toBe(1);
  });

  it('should reuse released objects', () => {
    const pool = new ObjectPool(
      () => ({ id: Math.random() }),
      (): void => {
        /* no-op */
      },
    );
    const obj1 = pool.acquire();
    pool.release(obj1);
    const obj2 = pool.acquire();
    expect(obj2).toBe(obj1);
  });

  it('should pre-fill pool', () => {
    const pool = new ObjectPool(
      () => ({}),
      (): void => {
        /* no-op */
      },
      5,
    );
    expect(pool.available).toBe(5);
  });

  it('should track active count', () => {
    const pool = new ObjectPool(
      () => ({}),
      (): void => {
        /* no-op */
      },
    );
    pool.acquire();
    pool.acquire();
    expect(pool.activeCount).toBe(2);
  });
});
