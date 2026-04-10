import { Request, Response } from 'express';
import { AuditLogService } from './audit-log.service';
import { AuthRequest } from '../../shared/middleware';
import { handleError } from '../../shared/error-handler';

export class AuditLogController {
  static async list(req: AuthRequest, res: Response) {
    try {
      const filters: Record<string, string> = {};
      const q = req.query as Record<string, string | undefined>;
      if (q.entity) filters.entity = q.entity;
      if (q.action) filters.action = q.action;
      if (q.userId) filters.userId = q.userId;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await AuditLogService.list(filters, { page, limit });
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }
}
