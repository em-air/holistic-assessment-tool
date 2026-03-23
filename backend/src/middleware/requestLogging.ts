import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import logger from '../lib/logger.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

/**
 * Generates a unique request ID and attaches it to the request
 * Also sets the X-Request-ID header for tracing
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Use existing request ID from header if present (for distributed tracing)
  const requestId = req.get('x-request-id') || randomUUID();
  
  req.requestId = requestId;
  req.startTime = Date.now();
  
  // Set response header for client-side tracing
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

/**
 * Logs incoming requests with timing information
 * Should be used after requestIdMiddleware
 */
export const requestLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip logging for health check endpoints to reduce noise
  if (req.path === '/api/health' || req.path === '/health') {
    return next();
  }

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || Date.now());
    const logData = {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      userId: (req as any).user?.id,
    };

    // Log at different levels based on status code
    if (res.statusCode >= 500) {
      logger.error(logData, 'Request failed');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'Request client error');
    } else if (duration > 3000) {
      // Log slow requests
      logger.warn(logData, 'Slow request detected');
    } else {
      logger.info(logData, 'Request completed');
    }
  });

  next();
};

/**
 * Performance monitoring middleware
 * Tracks and logs slow database queries and external API calls
 */
export const performanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const slowThreshold = 1000; // 1 second
  
  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || Date.now());
    
    if (duration > slowThreshold) {
      logger.warn({
        requestId: req.requestId,
        path: req.path,
        method: req.method,
        duration: `${duration}ms`,
        threshold: `${slowThreshold}ms`,
      }, 'Performance: Slow endpoint detected');
    }
  });

  next();
};

export default {
  requestIdMiddleware,
  requestLoggingMiddleware,
  performanceMiddleware,
};
