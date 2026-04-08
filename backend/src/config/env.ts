import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Treat empty strings as undefined so optional/default fields work on Railway
 */
const emptyToUndefined = (val: unknown) =>
  typeof val === 'string' && val.trim() === '' ? undefined : val;

/**
 * Environment variable validation schema
 * Validates all required environment variables at startup
 */
const envSchema = z.object({
  // Server
  NODE_ENV: z.preprocess(
    emptyToUndefined,
    z.enum(['development', 'production', 'test']).default('development'),
  ),
  PORT: z.preprocess(emptyToUndefined, z.string().transform(Number).default('3001')),
  LOG_LEVEL: z.preprocess(emptyToUndefined, z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info')),

  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY is required'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),

  // CORS
  FRONTEND_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  VERCEL_PREVIEW_URLS: z.preprocess(emptyToUndefined, z.string().optional()),

  // Redis (optional - for caching)
  REDIS_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),

  // AI (optional - for AI features)
  GOOGLE_AI_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),

  // Sentry (optional - for error tracking)
  SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().url().optional()),
  SENTRY_ENVIRONMENT: z.preprocess(emptyToUndefined, z.string().optional()),
  SENTRY_RELEASE: z.preprocess(emptyToUndefined, z.string().optional()),
  SENTRY_TRACES_SAMPLE_RATE: z.preprocess(emptyToUndefined, z.string().optional()),

  // Storage
  REPORTS_BUCKET: z.preprocess(emptyToUndefined, z.string().default('reports')),

  // AI — Gemini API key used from ai.ts
  GEMINI_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),

  // Session
  SESSION_STORAGE: z.preprocess(emptyToUndefined, z.enum(['auto', 'memory', 'redis']).default('auto')),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns typed config
 * Throws an error at startup if required variables are missing
 */
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.format();
    const errorMessages = Object.entries(errors)
      .filter(([key]) => key !== '_errors')
      .map(([key, value]) => {
        const err = value as { _errors?: string[] };
        return `  ${key}: ${err._errors?.join(', ') || 'Invalid'}`;
      })
      .join('\n');

    console.error('❌ Environment validation failed:\n' + errorMessages);
    process.exit(1);
  }

  return result.data;
}

// Validate on module load
export const env = validateEnv();

// Export helpers for common checks
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

// Feature flags based on optional env vars
export const features = {
  redis: !!env.REDIS_URL,
  ai: !!env.GEMINI_API_KEY || !!env.GOOGLE_AI_API_KEY,
  sentry: !!env.SENTRY_DSN,
};

export default env;
