import { prisma } from '../../shared/prisma';
import { SaleStatus } from '@prisma/client';

export class PromissoryNotesService {
  static async list(filters: { status?: string; customerId?: string; startDate?: Date; endDate?: Date }) {
    const where: Record<string, unknown> = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.customerId) {
      where.customerId = filters.customerId;
    }
    if (filters.startDate || filters.endDate) {
      where.dueDate = {};
      if (filters.startDate) (where.dueDate as Record<string, unknown>).gte = filters.startDate;
      if (filters.endDate) (where.dueDate as Record<string, unknown>).lte = filters.endDate;
    }

    const allNotes = await prisma.promissoryNote.findMany({
      where: where,
      include: { customer: true, sale: { include: { items: true } } },
      orderBy: [{ dueDate: 'asc' }],
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allNotes.map((note) => {
      const dueDate = new Date(note.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (note.status !== SaleStatus.PAID && dueDate < today) {
        if (note.status === SaleStatus.PENDING) {
          prisma.promissoryNote
            .update({ where: { id: note.id }, data: { status: SaleStatus.OVERDUE } })
            .catch(() => {});
          return { ...note, status: SaleStatus.OVERDUE };
        }
      }
      return note;
    });
  }

  static async getById(id: string) {
    return prisma.promissoryNote.findUnique({
      include: { customer: true, sale: { include: { items: true } } },
    });
  }

  static async pay(id: string, userId: string) {
    const result = await prisma.$transaction(async (tx) => {
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

    return result;
  }

  static async markWhatsApp(id: string) {
    return prisma.promissoryNote.update({
      where: { id },
      data: { whatsappSent: true, whatsappSentAt: new Date() },
    });
  }
}
