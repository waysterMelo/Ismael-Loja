import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/prisma';

export class SaleRepository {
  static async createWithTransaction(data: {
    customerId: string;
    totalAmount: number;
    status: any;
    notes?: string | null;
    items: { description: string; quantity: number; price: number }[];
    dueDate: Date;
    userId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          customerId: data.customerId,
          totalAmount: data.totalAmount,
          status: data.status,
          notes: data.notes,
          createdBy: data.userId,
        },
        include: { items: true, customer: true },
      });

      await tx.saleItem.createMany({
        data: data.items.map((item) => ({
          saleId: newSale.id,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      await tx.promissoryNote.create({
        data: {
          saleId: newSale.id,
          customerId: data.customerId,
          totalAmount: data.totalAmount,
          dueDate: data.dueDate,
          status: data.status,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: data.userId,
          action: 'CREATE_SALE',
          entity: 'Sale',
          entityId: newSale.id,
          payload: JSON.stringify({ customerId: data.customerId, totalAmount: data.totalAmount, itemCount: data.items.length }),
        },
      });

      return tx.sale.findUnique({
        where: { id: newSale.id },
        include: { items: true, customer: true, promissoryNote: true },
      });
    });
  }

  static async findMany(skip: number, take: number) {
    return prisma.sale.findMany({
      where: { deletedAt: null },
      skip,
      take,
      include: { items: true, customer: true, promissoryNote: true },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  static async count() {
    return prisma.sale.count({ where: { deletedAt: null } });
  }

  static async findById(id: string) {
    return prisma.sale.findUnique({
      where: { id, deletedAt: null },
      include: { items: true, customer: true, promissoryNote: true },
    });
  }

  static async findUnique(id: string) {
    return prisma.sale.findUnique({ where: { id } });
  }

  static async update(id: string, data: Prisma.SaleUpdateInput) {
    return prisma.sale.update({
      where: { id },
      data,
    });
  }
}
