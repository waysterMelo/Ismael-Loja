import { z } from 'zod';
import { prisma } from '../../shared/prisma';

const createCustomerSchema = z.object({
  name: z.string().min(1).max(255),
  cpf: z.string().min(11).max(14).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().max(255).optional(),
  address: z.string().max(500).optional(),
  isVip: z.boolean().optional(),
});

export class CustomerService {
  static async listAll() {
    return prisma.customer.findMany({
      orderBy: [{ name: 'asc' }],
      include: {
        sales: { select: { totalAmount: true, status: true, createdAt: true } },
      },
    });
  }

  static async create(data: { name: string; cpf?: string; email?: string; phone?: string; address?: string; isVip?: boolean }) {
    const parsed = createCustomerSchema.parse(data);

    if (parsed.cpf) {
      const existing = await prisma.customer.findFirst({ where: { cpf: parsed.cpf.replace(/\D/g, '') } });
      if (existing) {
        throw Object.assign(new Error('Customer with this CPF already exists'), { statusCode: 409 });
      }
    }

    return prisma.customer.create({
      data: {
        name: parsed.name,
        cpf: parsed.cpf ? parsed.cpf.replace(/\D/g, '') : null,
        phone: parsed.phone || null,
        email: parsed.email || null,
        address: parsed.address || null,
        isVip: parsed.isVip || false,
      },
    });
  }

  static async search(query: string) {
    const term = query.toLowerCase();
    const digitOnly = query.replace(/\D/g, '');
    return prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          { cpf: { contains: query.replace(/\D/g, ''), mode: 'insensitive' } },
          { phone: { contains: digitOnly, mode: 'insensitive' } },
        ],
      },
      orderBy: [{ name: 'asc' }],
    });
  }

  static async update(id: string, data: { name?: string; cpf?: string; phone?: string; email?: string; address?: string; isVip?: boolean }) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
    }

    if (data.cpf && data.cpf.replace(/\D/g, '') !== existing.cpf?.replace(/\D/g, '')) {
      const dup = await prisma.customer.findFirst({ where: { cpf: data.cpf.replace(/\D/g, '') } });
      if (dup) {
        throw Object.assign(new Error('Customer with this CPF already exists'), { statusCode: 409 });
      }
    }

    return prisma.customer.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        cpf: data.cpf !== undefined ? data.cpf.replace(/\D/g, '') : existing.cpf,
        phone: data.phone ?? existing.phone,
        email: data.email ?? existing.email,
        address: data.address ?? existing.address,
        isVip: data.isVip !== undefined ? data.isVip : existing.isVip,
      },
    });
  }

  static async getNotesByCustomerId(customerId: string) {
    return prisma.promissoryNote.findMany({
      where: { customerId },
      include: { sale: { include: { items: true } } },
      orderBy: [{ createdAt: 'desc' }],
    });
  }
}
