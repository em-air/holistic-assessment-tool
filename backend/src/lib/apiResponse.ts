import { Response } from 'express';

/**
 * Standardized API Error Codes
 * Use these codes in error responses for consistent client-side handling
 */
export const ErrorCodes = {
  // Authentication errors (1xxx)
  UNAUTHORIZED: 'AUTH_001',
  TOKEN_EXPIRED: 'AUTH_002',
  TOKEN_INVALID: 'AUTH_003',
  SESSION_EXPIRED: 'AUTH_004',

  // Authorization errors (2xxx)
  FORBIDDEN: 'AUTHZ_001',
  INSUFFICIENT_PERMISSIONS: 'AUTHZ_002',
  GRADE_ACCESS_DENIED: 'AUTHZ_003',

  // Validation errors (3xxx)
  VALIDATION_FAILED: 'VAL_001',
  INVALID_INPUT: 'VAL_002',
  MISSING_REQUIRED_FIELD: 'VAL_003',
  INVALID_FORMAT: 'VAL_004',

  // Resource errors (4xxx)
  NOT_FOUND: 'RES_001',
  ALREADY_EXISTS: 'RES_002',
  CONFLICT: 'RES_003',

  // Rate limiting (5xxx)
  RATE_LIMITED: 'RATE_001',
  TOO_MANY_REQUESTS: 'RATE_002',

  // Server errors (9xxx)
  INTERNAL_ERROR: 'SRV_001',
  DATABASE_ERROR: 'SRV_002',
  EXTERNAL_SERVICE_ERROR: 'SRV_003',
  TIMEOUT: 'SRV_004',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Standard success response structure
 */
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

/**
 * Standard error response structure
 */
interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
  requestId?: string;
}

/**
 * API Response helper class
 * Provides consistent response formatting across all endpoints
 */
export class ApiResponse {
  /**
   * Send a success response
   */
  static success<T>(res: Response, data: T, statusCode = 200, meta?: SuccessResponse<T>['meta']): Response {
    const response: SuccessResponse<T> = {
      success: true,
      data,
    };

    if (meta) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send a created response (201)
   */
  static created<T>(res: Response, data: T): Response {
    return this.success(res, data, 201);
  }

  /**
   * Send a no content response (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send a paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    options: { page: number; limit: number; total: number }
  ): Response {
    return this.success(res, data, 200, {
      page: options.page,
      limit: options.limit,
      total: options.total,
      hasMore: options.page * options.limit < options.total,
    });
  }

  /**
   * Send an error response
   */
  static error(
    res: Response,
    code: ErrorCode,
    message: string,
    statusCode = 400,
    details?: unknown
  ): Response {
    const response: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
      },
      requestId: (res.req as Express.Request)?.requestId,
    };

    if (details) {
      response.error.details = details;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send a validation error response
   */
  static validationError(res: Response, details: unknown): Response {
    return this.error(res, ErrorCodes.VALIDATION_FAILED, 'Validation failed', 400, details);
  }

  /**
   * Send an unauthorized error response
   */
  static unauthorized(res: Response, message = 'Authentication required'): Response {
    return this.error(res, ErrorCodes.UNAUTHORIZED, message, 401);
  }

  /**
   * Send a forbidden error response
   */
  static forbidden(res: Response, message = 'Access denied'): Response {
    return this.error(res, ErrorCodes.FORBIDDEN, message, 403);
  }

  /**
   * Send a not found error response
   */
  static notFound(res: Response, resource = 'Resource'): Response {
    return this.error(res, ErrorCodes.NOT_FOUND, `${resource} not found`, 404);
  }

  /**
   * Send a conflict error response
   */
  static conflict(res: Response, message = 'Resource already exists'): Response {
    return this.error(res, ErrorCodes.CONFLICT, message, 409);
  }

  /**
   * Send a rate limit error response
   */
  static rateLimited(res: Response, retryAfter?: number): Response {
    if (retryAfter) {
      res.setHeader('Retry-After', retryAfter);
    }
    return this.error(res, ErrorCodes.RATE_LIMITED, 'Too many requests', 429);
  }

  /**
   * Send an internal server error response
   */
  static internalError(res: Response, message = 'Internal server error'): Response {
    return this.error(res, ErrorCodes.INTERNAL_ERROR, message, 500);
  }

  /**
   * Send a database error response
   */
  static databaseError(res: Response, message = 'Database operation failed'): Response {
    return this.error(res, ErrorCodes.DATABASE_ERROR, message, 500);
  }
}

export default ApiResponse;
