import { Server } from 'http';
import logger from '../lib/logger.js';

interface ShutdownOptions {
  /** Timeout in milliseconds before forcing shutdown */
  timeout?: number;
  /** Custom cleanup functions to run before shutdown */
  cleanupHandlers?: Array<() => Promise<void>>;
}

const defaultOptions: Required<ShutdownOptions> = {
  timeout: 30000, // 30 seconds
  cleanupHandlers: [],
};

/**
 * Handles graceful shutdown of the server
 * - Stops accepting new connections
 * - Waits for existing requests to complete
 * - Runs cleanup handlers (e.g., close database connections)
 * - Forces shutdown after timeout
 */
export function setupGracefulShutdown(
  server: Server,
  options: ShutdownOptions = {}
): void {
  const { timeout, cleanupHandlers } = { ...defaultOptions, ...options };
  
  let isShuttingDown = false;
  const activeConnections = new Set<any>();

  // Track active connections
  server.on('connection', (connection) => {
    activeConnections.add(connection);
    connection.on('close', () => {
      activeConnections.delete(connection);
    });
  });

  const shutdown = async (signal: string) => {
    if (isShuttingDown) {
      logger.warn({ signal }, 'Shutdown already in progress, ignoring signal');
      return;
    }

    isShuttingDown = true;
    logger.info({ signal }, 'Shutdown signal received, starting graceful shutdown...');

    // Stop accepting new connections
    server.close(async (err) => {
      if (err) {
        logger.error({ err }, 'Error during server close');
      }

      logger.info(`Closed server, ${activeConnections.size} connections remaining`);
    });

    // Set up force shutdown timeout
    const forceShutdownTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, timeout);

    try {
      // Run cleanup handlers
      logger.info(`Running ${cleanupHandlers.length} cleanup handlers...`);
      
      await Promise.allSettled(
        cleanupHandlers.map(async (handler, index) => {
          try {
            await handler();
            logger.info(`Cleanup handler ${index + 1} completed`);
          } catch (err) {
            logger.error({ err, index }, 'Cleanup handler failed');
          }
        })
      );

      // Wait for existing connections to close
      let waitCount = 0;
      while (activeConnections.size > 0 && waitCount < 10) {
        logger.info(`Waiting for ${activeConnections.size} connections to close...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        waitCount++;
      }

      // Force close remaining connections
      if (activeConnections.size > 0) {
        logger.warn(`Forcefully closing ${activeConnections.size} remaining connections`);
        for (const connection of activeConnections) {
          connection.destroy();
        }
      }

      clearTimeout(forceShutdownTimer);
      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during graceful shutdown');
      clearTimeout(forceShutdownTimer);
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception, shutting down');
    shutdown('uncaughtException');
  });

  // Handle unhandled rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.fatal({ reason, promise }, 'Unhandled rejection, shutting down');
    shutdown('unhandledRejection');
  });

  logger.info('Graceful shutdown handlers registered');
}

/**
 * Creates a health check endpoint that returns server status
 * Returns 503 during shutdown to signal load balancers
 * Includes deep dependency checks (database, cache)
 */
export function createHealthCheck(deps?: { supabase?: any; cache?: any }) {
  let isHealthy = true;

  // Mark as unhealthy on shutdown signals
  process.on('SIGTERM', () => { isHealthy = false; });
  process.on('SIGINT', () => { isHealthy = false; });

  async function checkDatabase(): Promise<{ ok: boolean; latencyMs: number }> {
    if (!deps?.supabase) return { ok: true, latencyMs: 0 };
    const start = Date.now();
    try {
      const { error } = await deps.supabase.from('profiles').select('id').limit(1);
      return { ok: !error, latencyMs: Date.now() - start };
    } catch {
      return { ok: false, latencyMs: Date.now() - start };
    }
  }

  async function checkCache(): Promise<{ ok: boolean; type: string }> {
    if (!deps?.cache) return { ok: true, type: 'none' };
    try {
      const type = deps.cache.getStats?.().type ?? 'unknown';
      return { ok: true, type };
    } catch {
      return { ok: false, type: 'unknown' };
    }
  }

  return {
    isHealthy: () => isHealthy,
    setUnhealthy: () => { isHealthy = false; },
    handler: async (req: any, res: any) => {
      if (!isHealthy) {
        return res.status(503).json({
          status: 'shutting_down',
          timestamp: new Date().toISOString(),
        });
      }

      const [db, cacheStatus] = await Promise.all([checkDatabase(), checkCache()]);
      const allOk = db.ok && cacheStatus.ok;

      res.status(allOk ? 200 : 503).json({
        status: allOk ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
          database: db,
          cache: cacheStatus,
        },
        memory: process.memoryUsage(),
      });
    },
  };
}

export default {
  setupGracefulShutdown,
  createHealthCheck,
};
