/**
 * Session Storage Abstraction
 * 
 * Provides a unified interface for storing quiz sessions.
 * - Development: Uses in-memory Map (fast, no setup required)
 * - Production: Uses Redis (persistent, scalable, shared across instances)
 * 
 * Usage:
 *   import { sessionStorage } from './lib/sessionStorage';
 *   await sessionStorage.set('session-id', { userId: '123', ... });
 *   const session = await sessionStorage.get('session-id');
 */

import { createClient, RedisClientType } from 'redis';

// Session data interface
export interface QuizSession {
  userId: string;
  quizType: string;
  grade?: number;
  questionIds: string[];
  answers: Record<string, unknown>;
  startTime: number;
  isComplete: boolean;
}

// Storage interface
interface ISessionStorage {
  get(sessionId: string): Promise<QuizSession | null>;
  set(sessionId: string, session: QuizSession, ttlSeconds?: number): Promise<void>;
  delete(sessionId: string): Promise<void>;
  has(sessionId: string): Promise<boolean>;
  updateAnswer(sessionId: string, questionId: string, answer: unknown): Promise<boolean>;
  markComplete(sessionId: string): Promise<boolean>;
}

// ============================================
// IN-MEMORY STORAGE (Development)
// ============================================
class InMemorySessionStorage implements ISessionStorage {
  private store = new Map<string, QuizSession>();
  private timers = new Map<string, NodeJS.Timeout>();

  async get(sessionId: string): Promise<QuizSession | null> {
    return this.store.get(sessionId) || null;
  }

  async set(sessionId: string, session: QuizSession, ttlSeconds = 3600): Promise<void> {
    this.store.set(sessionId, session);
    
    // Clear existing timer if any
    const existingTimer = this.timers.get(sessionId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set expiration timer
    const timer = setTimeout(() => {
      this.store.delete(sessionId);
      this.timers.delete(sessionId);
    }, ttlSeconds * 1000);
    
    this.timers.set(sessionId, timer);
  }

  async delete(sessionId: string): Promise<void> {
    this.store.delete(sessionId);
    const timer = this.timers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(sessionId);
    }
  }

  async has(sessionId: string): Promise<boolean> {
    return this.store.has(sessionId);
  }

  async updateAnswer(sessionId: string, questionId: string, answer: unknown): Promise<boolean> {
    const session = this.store.get(sessionId);
    if (!session) return false;
    
    session.answers[questionId] = answer;
    return true;
  }

  async markComplete(sessionId: string): Promise<boolean> {
    const session = this.store.get(sessionId);
    if (!session) return false;
    
    session.isComplete = true;
    return true;
  }
}

// ============================================
// REDIS STORAGE (Production)
// ============================================
class RedisSessionStorage implements ISessionStorage {
  private client: RedisClientType;
  private prefix = 'quiz_session:';
  private isConnected = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis: Max retries reached, giving up');
            return new Error('Max retries reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis: Connected');
      this.isConnected = true;
    });

    this.client.on('reconnecting', () => {
      console.log('Redis: Reconnecting...');
    });

    // Connect immediately
    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Redis: Failed to connect:', error);
    }
  }

  private getKey(sessionId: string): string {
    return `${this.prefix}${sessionId}`;
  }

  async get(sessionId: string): Promise<QuizSession | null> {
    if (!this.isConnected) {
      console.warn('Redis: Not connected, cannot get session');
      return null;
    }

    try {
      const data = await this.client.get(this.getKey(sessionId));
      if (!data) return null;
      
      return JSON.parse(data) as QuizSession;
    } catch (error) {
      console.error('Redis: Error getting session:', error);
      return null;
    }
  }

  async set(sessionId: string, session: QuizSession, ttlSeconds = 3600): Promise<void> {
    if (!this.isConnected) {
      console.warn('Redis: Not connected, cannot set session');
      return;
    }

    try {
      const key = this.getKey(sessionId);
      const data = JSON.stringify(session);
      
      await this.client.setEx(key, ttlSeconds, data);
    } catch (error) {
      console.error('Redis: Error setting session:', error);
    }
  }

  async delete(sessionId: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.del(this.getKey(sessionId));
    } catch (error) {
      console.error('Redis: Error deleting session:', error);
    }
  }

  async has(sessionId: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const exists = await this.client.exists(this.getKey(sessionId));
      return exists > 0;
    } catch (error) {
      console.error('Redis: Error checking session:', error);
      return false;
    }
  }

  async updateAnswer(sessionId: string, questionId: string, answer: unknown): Promise<boolean> {
    const session = await this.get(sessionId);
    if (!session) return false;
    
    session.answers[questionId] = answer;
    
    // Get remaining TTL and reset with same TTL
    const ttl = await this.client.ttl(this.getKey(sessionId));
    await this.set(sessionId, session, ttl > 0 ? ttl : 3600);
    
    return true;
  }

  async markComplete(sessionId: string): Promise<boolean> {
    const session = await this.get(sessionId);
    if (!session) return false;
    
    session.isComplete = true;
    
    // Keep completed sessions for 1 hour for review
    await this.set(sessionId, session, 3600);
    
    return true;
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// ============================================
// HYBRID STORAGE (Fallback Pattern)
// ============================================
class HybridSessionStorage implements ISessionStorage {
  private redis: RedisSessionStorage;
  private memory: InMemorySessionStorage;
  private useRedis: boolean;

  constructor() {
    this.redis = new RedisSessionStorage();
    this.memory = new InMemorySessionStorage();
    this.useRedis = process.env.REDIS_URL !== undefined;
    
    if (this.useRedis) {
      console.log('Session Storage: Using Redis with in-memory fallback');
    } else {
      console.log('Session Storage: Using in-memory only (set REDIS_URL for Redis)');
    }
  }

  private async getStorage(): Promise<ISessionStorage> {
    // If Redis is configured and connected, use it
    if (this.useRedis) {
      const hasRedis = await this.redis.has('__ping__').catch(() => false);
      // If Redis fails, fall back to memory
      if (hasRedis === false && process.env.NODE_ENV !== 'production') {
        return this.memory;
      }
      return this.redis;
    }
    return this.memory;
  }

  async get(sessionId: string): Promise<QuizSession | null> {
    if (this.useRedis) {
      const result = await this.redis.get(sessionId);
      if (result) return result;
      // Fallback to memory
      return this.memory.get(sessionId);
    }
    return this.memory.get(sessionId);
  }

  async set(sessionId: string, session: QuizSession, ttlSeconds?: number): Promise<void> {
    if (this.useRedis) {
      await this.redis.set(sessionId, session, ttlSeconds);
    }
    // Always store in memory as backup
    await this.memory.set(sessionId, session, ttlSeconds);
  }

  async delete(sessionId: string): Promise<void> {
    if (this.useRedis) {
      await this.redis.delete(sessionId);
    }
    await this.memory.delete(sessionId);
  }

  async has(sessionId: string): Promise<boolean> {
    if (this.useRedis) {
      const inRedis = await this.redis.has(sessionId);
      if (inRedis) return true;
    }
    return this.memory.has(sessionId);
  }

  async updateAnswer(sessionId: string, questionId: string, answer: unknown): Promise<boolean> {
    let success = false;
    if (this.useRedis) {
      success = await this.redis.updateAnswer(sessionId, questionId, answer);
    }
    const memorySuccess = await this.memory.updateAnswer(sessionId, questionId, answer);
    return success || memorySuccess;
  }

  async markComplete(sessionId: string): Promise<boolean> {
    let success = false;
    if (this.useRedis) {
      success = await this.redis.markComplete(sessionId);
    }
    const memorySuccess = await this.memory.markComplete(sessionId);
    return success || memorySuccess;
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create session storage based on environment
 */
function createSessionStorage(): ISessionStorage {
  const storageType = process.env.SESSION_STORAGE || 'auto';
  
  switch (storageType) {
    case 'redis':
      console.log('Session Storage: Forcing Redis');
      return new RedisSessionStorage();
    
    case 'memory':
      console.log('Session Storage: Forcing in-memory');
      return new InMemorySessionStorage();
    
    case 'auto':
    default:
      // Use hybrid in production, memory in development
      if (process.env.NODE_ENV === 'production' || process.env.REDIS_URL) {
        return new HybridSessionStorage();
      }
      console.log('Session Storage: Using in-memory (development)');
      return new InMemorySessionStorage();
  }
}

// Export singleton instance
export const sessionStorage = createSessionStorage();

// Export types
export type { ISessionStorage };
