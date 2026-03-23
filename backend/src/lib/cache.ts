import logger from './logger.js';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Simple in-memory cache with TTL support
 * For production with multiple instances, use Redis instead
 */
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * Set a value in cache with TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttlMs Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, value: T, ttlMs = 300000): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries matching a pattern
   */
  clearPattern(pattern: string): number {
    let cleared = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    return cleared;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug({ cleaned, remaining: this.cache.size }, 'Cache cleanup completed');
    }
  }

  /**
   * Stop the cleanup interval (for graceful shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

// Singleton instance
export const cache = new MemoryCache();

/**
 * Cache decorator for async functions
 * Usage: const cachedFn = withCache('key', 60000, asyncFn);
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  keyPrefix: string,
  ttlMs: number,
  fn: T
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`;
    const cached = cache.get<ReturnType<T>>(cacheKey);
    
    if (cached !== undefined) {
      logger.debug({ key: cacheKey }, 'Cache hit');
      return cached;
    }

    const result = await fn(...args);
    cache.set(cacheKey, result, ttlMs);
    logger.debug({ key: cacheKey, ttlMs }, 'Cache miss - stored');
    
    return result;
  }) as T;
}

/**
 * Cache keys for common operations
 */
export const CacheKeys = {
  QUIZ_METADATA: 'quiz:metadata',
  QUIZ_BY_GRADE: (grade: string) => `quiz:grade:${grade}`,
  USER_PROGRESS: (userId: string) => `progress:${userId}`,
  USER_RESULTS: (userId: string) => `results:${userId}`,
};

/**
 * Cache TTLs (in milliseconds)
 */
export const CacheTTL = {
  SHORT: 60 * 1000,           // 1 minute
  MEDIUM: 5 * 60 * 1000,      // 5 minutes
  LONG: 15 * 60 * 1000,       // 15 minutes
  QUIZ_METADATA: 10 * 60 * 1000, // 10 minutes (quiz list doesn't change often)
};

export default cache;
