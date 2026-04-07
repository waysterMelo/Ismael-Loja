import { Request, Response } from 'express';
import { AuditLogService } from './audit-log.service';
import { AuthRequest } from '../../shared/middleware';

type ParamId = { id: string };

export class AuditLogController {
  static async list(req: AuthRequest, res: Response) {
    try {
      const filters: Record<string, string | number> = {};
      const q = req.query as Record<string, string | undefined>;
      if (q.entity) filters.entity = q.entity;
      if (q.action) filters.action = q.action;
      if (q.userId) filters.userId = q.userId;

      const logs = await AuditLogService.list(filters);
      res.json({ logs });
    } catch (e: unknown) {
      const err = e as { statusCode?: number; message?: string };
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  }
}
