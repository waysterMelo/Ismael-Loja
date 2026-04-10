import { Router, Request, Response } from 'express';
import { prisma } from '../../shared/prisma';
import { SaleStatus } from '@prisma/client';
import { authMiddleware, roleGuard } from '../../shared/middleware';

export const dashboardRouter = Router();
dashboardRouter.use(authMiddleware);
dashboardRouter.use(roleGuard('ADMIN'));

dashboardRouter.get('/', async (_req: Request, res: Response) => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  // Primeiro, marcar vencidos como OVERDUE (sem bloquear a resposta)
  await prisma.promissoryNote.updateMany({
    where: {
      status: SaleStatus.PENDING,
      dueDate: { lt: today },
    },
    data: { status: SaleStatus.OVERDUE },
  }).catch(() => {});

  // Depois buscar os dados atualizados
  const [totalOpen, overdueCount, dueTodayTotal, customerCount, recentSales] = await Promise.all([
    prisma.promissoryNote.aggregate({
      where: { status: SaleStatus.PENDING },
      _sum: { totalAmount: true },
    }),
    prisma.promissoryNote.count({
      where: { status: SaleStatus.OVERDUE },
    }),
    prisma.promissoryNote.aggregate({
      where: {
        status: { not: SaleStatus.PAID },
        dueDate: { gte: startOfDay, lt: endOfDay },
      },
      _sum: { totalAmount: true },
    }),
    prisma.customer.count(),
    prisma.sale.findMany({
      include: { customer: true },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const pendingValue = Number(totalOpen._sum.totalAmount || 0);
  const dueTodayValue = Number(dueTodayTotal._sum.totalAmount || 0);

  res.json({
    stats: {
      pendingValue,
      overdueCount,
      dueTodayValue,
      customerCount,
    },
    recentSales,
  });
});
