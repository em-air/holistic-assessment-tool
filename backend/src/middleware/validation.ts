import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import logger from '../lib/logger.js';

/**
 * Validation source types
 */
type ValidationSource = 'body' | 'query' | 'params';

interface ValidationOptions {
  /** Whether to strip unknown keys from the validated data */
  stripUnknown?: boolean;
  /** Custom error message prefix */
  errorPrefix?: string;
}

/**
 * Creates a validation middleware for the specified source and schema
 * 
 * @example
 * const validateBody = validate('body', createUserSchema);
 * router.post('/users', validateBody, createUserHandler);
 * 
 * @example
 * // Validate multiple sources
 * const validateRequest = validateAll({
 *   body: createUserSchema,
 *   params: userIdSchema,
 * });
 * router.put('/users/:id', validateRequest, updateUserHandler);
 */
export const validate = <T extends ZodSchema>(
  source: ValidationSource,
  schema: T,
  options: ValidationOptions = {}
) => {
  const { stripUnknown = true, errorPrefix = 'Validation' } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[source];
      
      // Apply strip unknown if enabled
      const processedSchema = stripUnknown && schema instanceof z.ZodObject
        ? (schema as z.ZodObject<any>).strip()
        : schema;

      const validated = await processedSchema.parseAsync(dataToValidate);
      
      // Replace the source with validated data
      (req as any)[source] = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));

        logger.debug({
          requestId: req.requestId,
          source,
          errors,
        }, `${errorPrefix} failed`);

        return res.status(400).json({
          error: `${errorPrefix} failed`,
          details: errors,
        });
      }

      logger.error({ err: error, requestId: req.requestId }, 'Unexpected validation error');
      return res.status(500).json({ error: 'Internal validation error' });
    }
  };
};

/**
 * Validates multiple sources at once
 */
export const validateAll = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}, options: ValidationOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const errors: Array<{ source: string; path: string; message: string }> = [];

    for (const [source, schema] of Object.entries(schemas)) {
      if (!schema) continue;

      try {
        const dataToValidate = req[source as ValidationSource];
        
        const processedSchema = options.stripUnknown !== false && schema instanceof z.ZodObject
          ? (schema as z.ZodObject<any>).strip()
          : schema;

        const validated = await processedSchema.parseAsync(dataToValidate);
        (req as any)[source] = validated;
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push(
            ...error.errors.map((e) => ({
              source,
              path: e.path.join('.'),
              message: e.message,
            }))
          );
        }
      }
    }

    if (errors.length > 0) {
      logger.debug({
        requestId: req.requestId,
        errors,
      }, 'Request validation failed');

      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    next();
  };
};

/**
 * Shorthand validators
 */
export const validateBody = <T extends ZodSchema>(schema: T, options?: ValidationOptions) =>
  validate('body', schema, options);

export const validateQuery = <T extends ZodSchema>(schema: T, options?: ValidationOptions) =>
  validate('query', schema, options);

export const validateParams = <T extends ZodSchema>(schema: T, options?: ValidationOptions) =>
  validate('params', schema, options);

/**
 * Common validation schemas
 */
export const commonSchemas = {
  uuid: z.string().uuid('Invalid UUID format'),
  
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    { message: 'Start date must be before or equal to end date' }
  ),

  sortOrder: z.enum(['asc', 'desc']).default('desc'),
};

export default {
  validate,
  validateAll,
  validateBody,
  validateQuery,
  validateParams,
  commonSchemas,
};
