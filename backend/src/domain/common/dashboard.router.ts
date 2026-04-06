import { Router, Request, Response } from 'express';
import { prisma } from '../../shared/prisma';
import { SaleStatus } from '@prisma/client';
import { authMiddleware } from '../../shared/middleware';

export const dashboardRouter = Router();
dashboardRouter.use(authMiddleware);

dashboardRouter.get('/', async (_req: Request, res: Response) => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const totalOpen = await prisma.promissoryNote.aggregate({
    where: { status: SaleStatus.PENDING },
    _sum: { totalAmount: true },
  });

  const overdue = await prisma.promissoryNote.findMany({
    where: {
      status: { in: [SaleStatus.PENDING] },
      dueDate: { lt: today },
    },
  });

  await Promise.all(
    overdue.map((note) =>
      prisma.promissoryNote
        .update({ where: { id: note.id }, data: { status: SaleStatus.OVERDUE } })
        .catch(() => {})
    )
  );

  const overdueCount = await prisma.promissoryNote.count({
    where: { status: SaleStatus.OVERDUE },
  });

  const dueTodayTotal = await prisma.promissoryNote.aggregate({
    where: {
      status: { not: SaleStatus.PAID },
      dueDate: { gte: startOfDay, lt: endOfDay },
    },
    _sum: { totalAmount: true },
  });

  const customerCount = await prisma.customer.count();

  const recentSales = await prisma.sale.findMany({
    include: { customer: true },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

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
