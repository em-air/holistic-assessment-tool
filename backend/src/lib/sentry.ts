import * as Sentry from '@sentry/node';
import { env } from '../config/env.js';

const SENSITIVE_KEYS = new Set([
  'student_name',
  'parent_email',
  'email',
  'authorization',
  'token',
  'access_token',
  'refresh_token',
]);

let sentryEnabled = false;
let sentryInitialized = false;

function parseSampleRate(rawValue: string | undefined): number {
  const parsed = Number(rawValue ?? '0.05');
  if (!Number.isFinite(parsed)) {
    return 0.05;
  }
  if (parsed < 0) {
    return 0;
  }
  if (parsed > 1) {
    return 1;
  }
  return parsed;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function shouldRedactKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return (
    SENSITIVE_KEYS.has(normalized) ||
    normalized.includes('response') ||
    normalized.includes('responses') ||
    normalized.includes('answer') ||
    normalized.includes('answers')
  );
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    if (shouldRedactKey(key)) {
      sanitized[key] = '[redacted]';
      continue;
    }

    sanitized[key] = sanitizeValue(nestedValue);
  }

  return sanitized;
}

function sanitizeEvent<T extends Record<string, unknown>>(event: T): T {
  const mutableEvent = event as T & {
    user?: Record<string, unknown>;
    extra?: Record<string, unknown>;
    contexts?: Record<string, unknown>;
    request?: { data?: unknown };
  };

  if (mutableEvent.user && typeof mutableEvent.user.email === 'string') {
    mutableEvent.user.email = '[redacted]';
  }

  if (mutableEvent.extra) {
    mutableEvent.extra = sanitizeValue(mutableEvent.extra) as Record<string, unknown>;
  }

  if (mutableEvent.contexts) {
    mutableEvent.contexts = sanitizeValue(mutableEvent.contexts) as Record<string, unknown>;
  }

  if (mutableEvent.request?.data) {
    mutableEvent.request.data = sanitizeValue(mutableEvent.request.data);
  }

  return mutableEvent;
}

export function initSentry(): void {
  if (sentryInitialized || env.NODE_ENV === 'test') {
    return;
  }

  const dsn = env.SENTRY_DSN;
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: env.SENTRY_ENVIRONMENT || env.NODE_ENV,
    release: env.SENTRY_RELEASE,
    tracesSampleRate: parseSampleRate(env.SENTRY_TRACES_SAMPLE_RATE),
    beforeSend(event) {
      return sanitizeEvent(event as unknown as Record<string, unknown>) as unknown as typeof event;
    },
  });

  sentryInitialized = true;
  sentryEnabled = true;
}

export function captureException(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (!sentryEnabled) {
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      const sanitizedContext = sanitizeValue(context);
      if (isPlainObject(sanitizedContext)) {
        const route = sanitizedContext.route;
        const method = sanitizedContext.method;
        const requestId = sanitizedContext.requestId;
        const userRole = sanitizedContext.userRole;

        if (typeof route === 'string') {
          scope.setTag('route', route);
        }
        if (typeof method === 'string') {
          scope.setTag('method', method);
        }
        if (typeof requestId === 'string') {
          scope.setTag('requestId', requestId);
        }
        if (typeof userRole === 'string') {
          scope.setTag('userRole', userRole);
        }

        scope.setContext('request', sanitizedContext);
      }
    }

    Sentry.captureException(error);
  });
}
