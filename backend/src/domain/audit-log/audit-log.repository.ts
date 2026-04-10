import { prisma } from '../../shared/prisma';

export class AuditLogRepository {
  static async create(data: { userId: string; action: string; entity: string; entityId: string; payload: string }) {
    return prisma.auditLog.create({ data });
  }

  static async findMany(where: Record<string, unknown>, skip: number, take: number) {
    return prisma.auditLog.findMany({
      where,
      skip,
      take,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async count(where: Record<string, unknown>) {
    return prisma.auditLog.count({ where });
  }
}