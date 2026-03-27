/**
 * Input Sanitization Utilities
 * Provides functions to clean and validate user input for security
 */

/**
 * HTML entities map for escaping
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove HTML tags from string
 */
export function stripHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize string for safe database storage
 * - Trims whitespace
 * - Removes null bytes
 * - Normalizes unicode
 */
export function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/\0/g, '') // Remove null bytes
    .normalize('NFC'); // Normalize unicode
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  return email
    .toLowerCase()
    .trim()
    .replace(/\s/g, ''); // Remove all whitespace
}

/**
 * Validate and sanitize UUID
 */
export function sanitizeUuid(uuid: string): string | null {
  if (typeof uuid !== 'string') return null;
  const cleaned = uuid.trim().toLowerCase();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(cleaned) ? cleaned : null;
}

/**
 * Sanitize integer input
 */
export function sanitizeInt(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Sanitize and clamp integer to range
 */
export function sanitizeIntInRange(value: unknown, min: number, max: number, defaultValue?: number): number {
  const num = sanitizeInt(value, defaultValue ?? min);
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') return '';
  return filename
    .replace(/\.\./g, '') // Remove path traversal
    .replace(/[/\\:*?"<>|]/g, '') // Remove invalid chars
    .replace(/^\.+/, '') // Remove leading dots
    .trim();
}

/**
 * Sanitize URL - ensure it's safe
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Truncate string to max length
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Deep sanitize an object - sanitize all string values
 */
export function deepSanitize<T extends Record<string, unknown>>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeString(item)
          : typeof item === 'object' && item !== null
            ? deepSanitize(item as Record<string, unknown>)
            : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = deepSanitize(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Check if string contains potential SQL injection patterns
 * Note: This is a secondary check - always use parameterized queries
 */
export function hasSqlInjectionPatterns(str: string): boolean {
  if (typeof str !== 'string') return false;
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
    /(-{2}|\/\*|\*\/)/,
    /(;|\||`)/,
    /(\bOR\b\s+\d+\s*=\s*\d+)/i,
    /(\bAND\b\s+\d+\s*=\s*\d+)/i,
  ];
  return patterns.some((pattern) => pattern.test(str));
}

/**
 * Validate that a string only contains allowed characters
 */
export function isAlphanumeric(str: string, allowSpaces = false): boolean {
  if (typeof str !== 'string') return false;
  const pattern = allowSpaces ? /^[a-zA-Z0-9\s]+$/ : /^[a-zA-Z0-9]+$/;
  return pattern.test(str);
}

/**
 * Validate grade format (e.g., "Grade 1", "Grade 8")
 */
export function isValidGrade(grade: string): boolean {
  if (typeof grade !== 'string') return false;
  return /^Grade\s[1-8]$/i.test(grade.trim());
}

/**
 * Normalize grade string to consistent format
 */
export function normalizeGrade(grade: string): string | null {
  if (!isValidGrade(grade)) return null;
  const match = grade.match(/\d/);
  return match ? `Grade ${match[0]}` : null;
}

export default {
  escapeHtml,
  stripHtml,
  sanitizeString,
  sanitizeEmail,
  sanitizeUuid,
  sanitizeInt,
  sanitizeIntInRange,
  sanitizeFilename,
  sanitizeUrl,
  truncate,
  deepSanitize,
  hasSqlInjectionPatterns,
  isAlphanumeric,
  isValidGrade,
  normalizeGrade,
};
