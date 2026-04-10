import { z } from 'zod';
import { SaleStatus } from '@prisma/client';
import { paginate, PaginationParams } from '../../shared/pagination';
import { SaleRepository } from './sales.repository';
import { CustomerRepository } from '../customers/customers.repository';
import { AuditLogRepository } from '../audit-log/audit-log.repository';

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

    const customer = await CustomerRepository.findUnique(parsed.customerId);
    if (!customer) {
      throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
    }

    const totalAmount = parsed.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const status = parsed.status || SaleStatus.PENDING;
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const sale = await SaleRepository.createWithTransaction({
      customerId: parsed.customerId,
      totalAmount,
      status,
      notes: parsed.notes,
      items: parsed.items,
      dueDate,
      userId,
    });

    return sale;
  }

  static async listAll(pagination: PaginationParams) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      SaleRepository.findMany(skip, limit),
      SaleRepository.count(),
    ]);

    return {
      data: sales,
      pagination: paginate({ page, limit }, total),
    };
  }

  static async getById(id: string) {
    return SaleRepository.findById(id);
  }

  static async softDelete(id: string, userId: string) {
    const existing = await SaleRepository.findUnique(id);
    if (!existing) {
      throw Object.assign(new Error('Sale not found'), { statusCode: 404 });
    }

    if (existing.deletedAt) {
      throw Object.assign(new Error('Sale already deleted'), { statusCode: 400 });
    }

    const sale = await SaleRepository.update(id, { deletedAt: new Date() });

    await AuditLogRepository.create({
      userId,
      action: 'DELETE_SALE',
      entity: 'Sale',
      entityId: sale.id,
      payload: JSON.stringify({ customerId: sale.customerId, totalAmount: sale.totalAmount }),
    });

    return sale;
  }

  static async restore(id: string, userId: string) {
    const existing = await SaleRepository.findUnique(id);
    if (!existing) {
      throw Object.assign(new Error('Sale not found'), { statusCode: 404 });
    }

    if (!existing.deletedAt) {
      throw Object.assign(new Error('Sale is not deleted'), { statusCode: 400 });
    }

    const sale = await SaleRepository.update(id, { deletedAt: null });

    await AuditLogRepository.create({
      userId,
      action: 'RESTORE_SALE',
      entity: 'Sale',
      entityId: sale.id,
      payload: JSON.stringify({ customerId: sale.customerId, totalAmount: sale.totalAmount }),
    });

    return sale;
  }
}
