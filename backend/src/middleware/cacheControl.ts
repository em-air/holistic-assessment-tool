import { Request, Response, NextFunction } from 'express';

/**
 * Cache control preset configurations
 */
export const cachePresets = {
  /** No caching - for dynamic/authenticated content */
  noCache: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
  
  /** Short cache - for frequently changing content (1 minute) */
  short: {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
  },
  
  /** Medium cache - for semi-static content (15 minutes) */
  medium: {
    'Cache-Control': 'public, max-age=900, stale-while-revalidate=60',
  },
  
  /** Long cache - for static content (1 hour) */
  long: {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300',
  },
  
  /** Immutable - for versioned/fingerprinted assets (1 year) */
  immutable: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
  
  /** Private cache - for user-specific content (5 minutes) */
  private: {
    'Cache-Control': 'private, max-age=300, must-revalidate',
  },
};

type CachePreset = keyof typeof cachePresets;

/**
 * Middleware factory for setting cache control headers
 * 
 * @example
 * // Use preset
 * router.get('/static-data', cacheControl('long'), handler);
 * 
 * @example
 * // Use custom max-age
 * router.get('/data', cacheControl(120), handler);
 */
export const cacheControl = (preset: CachePreset | number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (typeof preset === 'number') {
      res.setHeader('Cache-Control', `public, max-age=${preset}`);
    } else {
      const headers = cachePresets[preset];
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }
    next();
  };
};

/**
 * Middleware to set no-cache headers for authenticated routes
 * Should be applied to routes that return user-specific data
 */
export const noCache = (req: Request, res: Response, next: NextFunction) => {
  Object.entries(cachePresets.noCache).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
};

/**
 * Conditional caching middleware
 * Sets cache headers based on the response status or path
 */
export const conditionalCache = (options: {
  successCache?: CachePreset | number;
  errorCache?: CachePreset | number;
  pathPatterns?: Array<{ pattern: RegExp; preset: CachePreset | number }>;
}) => {
  const { successCache = 'short', errorCache = 'noCache', pathPatterns = [] } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Check path patterns first
    for (const { pattern, preset } of pathPatterns) {
      if (pattern.test(req.path)) {
        applyCache(res, preset);
        return next();
      }
    }

    // Apply cache headers on response finish based on status
    const originalEnd = res.end.bind(res);
    res.end = function (this: Response, chunk?: any, encoding?: BufferEncoding | (() => void), cb?: () => void) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        applyCache(res, successCache);
      } else {
        applyCache(res, errorCache);
      }
      
      if (typeof encoding === 'function') {
        return originalEnd(chunk, encoding);
      }
      if (encoding) {
        return originalEnd(chunk, encoding, cb);
      }
      return originalEnd(chunk);
    } as typeof res.end;

    next();
  };
};

function applyCache(res: Response, preset: CachePreset | number) {
  if (typeof preset === 'number') {
    res.setHeader('Cache-Control', `public, max-age=${preset}`);
  } else {
    const headers = cachePresets[preset];
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
  }
}

/**
 * ETag support middleware
 * Generates and validates weak ETags for conditional requests
 */
export const etagSupport = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function (this: Response, body: any) {
      // Generate weak ETag from content
      const content = JSON.stringify(body);
      const hash = simpleHash(content);
      const etag = `W/"${hash}"`;
      
      res.setHeader('ETag', etag);
      
      // Check If-None-Match
      const ifNoneMatch = req.get('If-None-Match');
      if (ifNoneMatch === etag) {
        res.status(304);
        return res.end();
      }
      
      return originalJson.call(this, body);
    };

    next();
  };
};

// Simple hash function for ETag generation
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export default {
  cacheControl,
  cachePresets,
  noCache,
  conditionalCache,
  etagSupport,
};
