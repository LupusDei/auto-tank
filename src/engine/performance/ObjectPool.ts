/** Generic object pool to avoid garbage collection pressure. */
export class ObjectPool<T> {
  private readonly pool: T[] = [];
  private readonly factory: () => T;
  private readonly reset: (obj: T) => void;
  private _activeCount = 0;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize = 0) {
    this.factory = factory;
    this.reset = reset;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  /** Acquire an object from the pool. */
  acquire(): T {
    this._activeCount++;
    const obj = this.pool.pop();
    if (obj) {
      this.reset(obj);
      return obj;
    }
    return this.factory();
  }

  /** Release an object back to the pool. */
  release(obj: T): void {
    this._activeCount = Math.max(0, this._activeCount - 1);
    this.pool.push(obj);
  }

  /** Release multiple objects. */
  releaseAll(objects: T[]): void {
    for (const obj of objects) this.release(obj);
  }

  get available(): number {
    return this.pool.length;
  }
  get activeCount(): number {
    return this._activeCount;
  }
  get totalCreated(): number {
    return this.pool.length + this._activeCount;
  }
}
