import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration - strict origin checking
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  // Add Vercel preview URL patterns if needed
  ...(process.env.VERCEL_PREVIEW_URLS?.split(',') || []),
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
      if (process.env.NODE_ENV === 'production') {
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/profile', profileRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quiz-content', quizContentRoutes);

// Error handling middleware
app.use((err: Error & { status?: number; errors?: unknown }, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Only log errors in development or if they're 500-level errors
  if (process.env.NODE_ENV !== 'production' || !err.status || err.status >= 500) {
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
  }
  
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors,
    });
  }

  // Don't expose error details in production
  const message = process.env.NODE_ENV === 'production' && (!err.status || err.status >= 500)
    ? 'Internal server error'
    : err.message;

  res.status(err.status || 500).json({
    error: message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  // These logs are acceptable for server startup
  if (process.env.NODE_ENV !== 'test') {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  }
});

export default app;
