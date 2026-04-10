import { paginate, PaginationParams } from '../../shared/pagination';
import { AuditLogRepository } from './audit-log.repository';

export class AuditLogService {
  static async list(filters: { entity?: string; action?: string; userId?: string }, pagination: PaginationParams) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters.entity) where.entity = filters.entity;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;

    const [logs, total] = await Promise.all([
      AuditLogRepository.findMany(where, skip, limit),
      AuditLogRepository.count(where),
    ]);

    return {
      data: logs,
      pagination: paginate({ page, limit }, total),
    };
  }
}
