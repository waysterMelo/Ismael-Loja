import { Prisma, SaleStatus } from '@prisma/client';
import { prisma } from '../../shared/prisma';

export class PromissoryNoteRepository {
  static async findPendingOverdueIds(date: Date) {
    const notes = await prisma.promissoryNote.findMany({
      where: {
        status: SaleStatus.PENDING,
        dueDate: { lt: date },
      },
      select: { id: true },
    });
    return notes.map(n => n.id);
  }

  static async findMany(where: Prisma.PromissoryNoteWhereInput, skip: number, take: number) {
    return prisma.promissoryNote.findMany({
      where,
      skip,
      take,
      include: { customer: true, sale: { include: { items: true } } },
      orderBy: [{ dueDate: 'asc' }],
    });
  }

  static async count(where: Prisma.PromissoryNoteWhereInput) {
    return prisma.promissoryNote.count({ where });
  }

  static async updateManyStatus(ids: string[], status: SaleStatus) {
    if (ids.length === 0) return;
    return prisma.promissoryNote.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
  }

  static async findById(id: string) {
    return prisma.promissoryNote.findUnique({
      where: { id },
      include: { customer: true, sale: { include: { items: true } } },
    });
  }

  static async pay(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const note = await tx.promissoryNote.update({
        where: { id },
        data: { status: SaleStatus.PAID, paidAt: new Date() },
      });

      await tx.sale.update({ where: { id: note.saleId }, data: { status: SaleStatus.PAID } });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'PAY_PROMISSORY_NOTE',
          entity: 'PromissoryNote',
          entityId: id,
          payload: JSON.stringify({ titleId: id, saleId: note.saleId, paidAt: new Date() }),
        },
      });

      return note;
    });
  }
}
