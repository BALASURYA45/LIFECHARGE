/**
 * High-performance In-Memory TTL Cache with automatic expiration pruning.
 */
class SimpleTTLCache {
  constructor(defaultTtlSeconds = 300) {
    this.cache = new Map();
    this.defaultTtl = defaultTtlSeconds * 1000;
  }

  set(key, value, ttlSeconds = null) {
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtl;
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  del(key) {
    this.cache.delete(key);
  }

  flush() {
    this.cache.clear();
  }

  async getOrSet(key, ttlSeconds, fetchFn) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    if (value !== undefined && value !== null) {
      this.set(key, value, ttlSeconds);
    }
    return value;
  }

  stats() {
    let active = 0;
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now <= item.expiresAt) {
        active++;
      }
    }
    return { totalKeys: this.cache.size, activeKeys: active };
  }
}

export const memoryCache = new SimpleTTLCache(300); // 5 minute default TTL
export default memoryCache;
