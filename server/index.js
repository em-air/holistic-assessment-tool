/**
 * @deprecated This legacy email server is DEPRECATED.
 * 
 * Use the main backend instead:
 *   - Backend: backend/src/routes/reports.ts
 *   - Endpoint: POST /api/reports/send-email
 *   - Endpoint: POST /api/reports/generate (with send_email: true)
 * 
 * The main backend uses Resend for production-grade email delivery.
 * This file is kept only for backward compatibility and will be removed.
 * 
 * To migrate:
 *   1. Update your API calls to use the main backend URL
 *   2. Use the new endpoint format (see backend/docs/)
 *   3. Remove any references to this server
 */

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Deprecation warning for all routes
app.use((req, res, next) => {
  console.warn(`[DEPRECATED] Legacy email server accessed: ${req.method} ${req.path}`);
  console.warn('Please migrate to the main backend at /api/reports/send-email');
  next();
});

// Legacy endpoint - returns deprecation notice
app.post('/api/send-report', (req, res) => {
  res.status(410).json({
    success: false,
    deprecated: true,
    message: 'This endpoint is deprecated. Use POST /api/reports/send-email on the main backend instead.',
    migration: {
      newEndpoint: '/api/reports/send-email',
      documentation: 'See backend/docs/ for API documentation',
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'deprecated',
    message: 'This server is deprecated. Use the main backend instead.',
  });
});

app.listen(PORT, () => {
  console.warn('');
  console.warn('⚠️  WARNING: This legacy email server is DEPRECATED');
  console.warn('⚠️  Please use the main backend at backend/src instead');
  console.warn('⚠️  Endpoint: POST /api/reports/send-email');
  console.warn('');
});
