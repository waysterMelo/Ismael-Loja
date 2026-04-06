import { z } from 'zod';
import { prisma } from '../../shared/prisma';
import { SaleStatus } from '@prisma/client';

const saleItemSchema = z.object({
  description: z.string().min(1).max(255),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
});

const createSaleSchema = z.object({
  customerId: z.string().uuid().min(1),
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  status: z.nativeEnum(SaleStatus).optional(),
  notes: z.string().max(500).optional().nullable(),
});

export class SalesService {
  static async create(data: { customerId: string; items: { description: string; quantity: number; price: number }[]; status?: SaleStatus; notes?: string | null }, userId: string) {
    const parsed = createSaleSchema.parse(data);

    const customer = await prisma.customer.findUnique({ where: { id: parsed.customerId } });
    if (!customer) {
      throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
    }

    const totalAmount = parsed.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const status = parsed.status || SaleStatus.PENDING;

    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          customerId: parsed.customerId,
          totalAmount,
          status,
          notes: parsed.notes,
          createdBy: userId,
        },
        include: { items: true, customer: true },
      });

      await tx.saleItem.createMany({
        data: parsed.items.map((item) => ({
          saleId: newSale.id,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      await tx.promissoryNote.create({
        data: {
          saleId: newSale.id,
          customerId: parsed.customerId,
          totalAmount,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status,
        },
      });

      const fullSale = await tx.sale.findUnique({
        where: { id: newSale.id },
        include: { items: true, customer: true, promissoryNote: true },
      });

      return fullSale;
    });

    return sale;
  }

  static async listAll() {
    return prisma.sale.findMany({
      include: { items: true, customer: true, promissoryNote: true },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  static async getById(id: string) {
    return prisma.sale.findUnique({
      include: { items: true, customer: true, promissoryNote: true },
    });
  }
}
