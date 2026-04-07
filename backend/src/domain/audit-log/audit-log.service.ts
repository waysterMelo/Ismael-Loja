import { prisma } from '../../shared/prisma';

export class AuditLogService {
  static async list(filters: { entity?: string; action?: string; userId?: string; limit?: number }) {
    const where: Record<string, unknown> = {};
    if (filters.entity) where.entity = filters.entity;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;

    return prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 50,
    });
  }
}
