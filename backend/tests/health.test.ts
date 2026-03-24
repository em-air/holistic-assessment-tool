import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';

// Create a minimal test app with health endpoint
function createTestApp(): Express {
  const app = express();
  
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
    });
  });

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
    });
  });

  return app;
}

describe('Health Check Endpoints', () => {
  let app: Express;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });

    it('should return status ok', async () => {
      const response = await request(app).get('/health');
      expect(response.body.status).toBe('ok');
    });

    it('should include uptime', async () => {
      const response = await request(app).get('/health');
      expect(response.body.uptime).toBeDefined();
      expect(typeof response.body.uptime).toBe('number');
    });

    it('should include timestamp', async () => {
      const response = await request(app).get('/health');
      expect(response.body.timestamp).toBeDefined();
      // Should be a valid ISO date string
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
    });

    it('should include memory usage', async () => {
      const response = await request(app).get('/health');
      expect(response.body.memory).toBeDefined();
      expect(response.body.memory.heapUsed).toBeDefined();
    });
  });

  describe('GET /api/health', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
    });

    it('should return status ok', async () => {
      const response = await request(app).get('/api/health');
      expect(response.body.status).toBe('ok');
    });
  });
});
