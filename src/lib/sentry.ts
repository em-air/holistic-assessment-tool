import * as Sentry from '@sentry/react';

const SENSITIVE_KEYS = new Set([
  'student_name',
  'parent_email',
  'email',
  'authorization',
  'token',
  'access_token',
  'refresh_token',
]);

let sentryInitialized = false;
let sentryEnabled = false;

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

export function initFrontendSentry(): void {
  if (sentryInitialized || import.meta.env.MODE === 'test') {
    return;
  }

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || 'unknown',
    tracesSampleRate: parseSampleRate(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE),
    beforeSend(event) {
      return sanitizeEvent(event as unknown as Record<string, unknown>) as unknown as typeof event;
    },
  });

  sentryInitialized = true;
  sentryEnabled = true;
}

export function captureFrontendException(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (!sentryEnabled) {
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('frontend', sanitizeValue(context) as Record<string, unknown>);
    }
    Sentry.captureException(error);
  });
}
