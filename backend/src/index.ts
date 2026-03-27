import logger from './lib/logger.js';
import { initSentry, captureException } from './lib/sentry.js';
import { setupGracefulShutdown, createHealthCheck } from './lib/shutdown.js';
import { cache } from './lib/cache.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env, isProduction, features } from './config/env.js';
import { requestIdMiddleware, requestLoggingMiddleware, performanceMiddleware } from './middleware/requestLogging.js';

// Initialize Sentry if configured
if (features.sentry) {
  initSentry();
}

// Import routes
import profileRoutes from './routes/profile.js';
import quizRoutes from './routes/quizzes.js';
import resultRoutes from './routes/results.js';
import progressRoutes from './routes/progress.js';
import reportRoutes from './routes/reports.js';
import adminRoutes from './routes/admin.js';
import teacherRoutes from './routes/teacher.js';
import aiRoutes from './routes/ai.js';
import quizContentRoutes from './routes/quizContent.js';

const app = express();
const PORT = env.PORT;

// Railway runs behind a reverse proxy; trust proxy headers for correct client IP handling.
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://*.supabase.co'],
      connectSrc: [
        "'self'",
        env.FRONTEND_URL || 'http://localhost:5173',
        env.SUPABASE_URL,
        'https://*.sentry.io',
      ].filter(Boolean) as string[],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow loading cross-origin resources (fonts, images)
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Response compression
app.use(compression());

// Request ID and logging middleware
app.use(requestIdMiddleware);
app.use(requestLoggingMiddleware);
app.use(performanceMiddleware);

// Response compression
app.use(compression());

// Request ID and logging middleware
app.use(requestIdMiddleware);
app.use(requestLoggingMiddleware);
app.use(performanceMiddleware);

// CORS configuration - strict origin checking
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  env.FRONTEND_URL,
  // Add Vercel preview URL patterns if needed
  ...(env.VERCEL_PREVIEW_URLS?.split(',') || []),
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, mobile apps)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in the allowed list
    const isAllowed = allowedOrigins.some(allowed => {
      // Exact match or starts with (for Vercel preview URLs)
      return origin === allowed || origin.startsWith(allowed.replace(/\/$/, ''));
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // In production, reject unknown origins
      // In development, allow but log
      if (isProduction) {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      } else {
        callback(null, true);
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Tiered rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many auth attempts, please try again later.' },
});

const quizSubmitLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { error: 'Too many submissions, please slow down.' },
});

const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many report requests, please try again later.' },
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { error: 'AI rate limit reached, please try again shortly.' },
});

app.use(globalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced health check endpoint
const healthCheck = createHealthCheck();
app.get('/api/health', healthCheck.handler);
app.get('/health', healthCheck.handler); // Alternative path for load balancers

// API routes
app.use('/api/profile', authLimiter, profileRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', quizSubmitLimiter, resultRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reports', reportLimiter, reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/quiz-content', quizSubmitLimiter, quizContentRoutes);

// Error handling middleware
app.use((err: Error & { status?: number; errors?: unknown }, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Only log errors in development or if they're 500-level errors
  if (!isProduction || !err.status || err.status >= 500) {
    logger.error({ err, requestId: req.requestId }, 'Request error');
  }

  if (err.name !== 'ZodError' && (!err.status || err.status >= 500)) {
    const requestWithUser = req as express.Request & { user?: { role?: string } };
    captureException(err, {
      route: req.originalUrl,
      method: req.method,
      requestId: req.requestId || undefined,
      userRole: requestWithUser.user?.role,
      origin: req.get('origin') || undefined,
    });
  }
  
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors,
      requestId: req.requestId,
    });
  }

  // Don't expose error details in production
  const message = isProduction && (!err.status || err.status >= 500)
    ? 'Internal server error'
    : err.message;

  res.status(err.status || 500).json({
    error: message,
    requestId: req.requestId,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', requestId: req.requestId });
});

// Start server with graceful shutdown
const server = app.listen(PORT, () => {
  if (env.NODE_ENV !== 'test') {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Features: ${Object.entries(features).filter(([, v]) => v).map(([k]) => k).join(', ') || 'none'}`);
  }
});

// Setup graceful shutdown
setupGracefulShutdown(server, {
  timeout: 30000,
  cleanupHandlers: [
    async () => {
      logger.info('Cleaning up cache...');
      cache.destroy();
    },
  ],
});

export default app;
