import logger from '../lib/logger.js';
import { supabaseAdmin } from '../config/supabase.js';
import { Request, Response, NextFunction } from 'express';

export interface AuditEntry {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}

/**
 * Log an audit event to the database.
 * Fire-and-forget — never blocks the request.
 */
export async function logAudit(req: Request, entry: AuditEntry): Promise<void> {
  try {
    const userId = req.user?.id ?? null;
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId ?? null,
      details: entry.details ?? {},
      ip_address: req.ip ?? null,
      user_agent: req.headers['user-agent']?.substring(0, 512) ?? null,
    });
  } catch (err) {
    // Never let audit failures break the request
    logger.warn({ err, entry }, 'Failed to write audit log');
  }
}

/**
 * Express middleware that automatically logs mutating admin actions.
 * Attach after auth middleware on admin routes.
 */
export function auditMiddleware(action: string, resourceType: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Capture the original json method to log after response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Only audit successful mutations
      if (res.statusCode < 400) {
        logAudit(req, {
          action,
          resourceType,
          resourceId: req.params.id || req.params.userId || body?.data?.id,
          details: { method: req.method, path: req.path, statusCode: res.statusCode },
        });
      }
      return originalJson(body);
    };
    next();
  };
}
