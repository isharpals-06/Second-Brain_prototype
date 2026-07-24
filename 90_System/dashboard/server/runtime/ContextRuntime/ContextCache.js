export class ContextCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, data, ttlMs = 300000) {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { data, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  invalidate(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const contextCache = new ContextCache();
