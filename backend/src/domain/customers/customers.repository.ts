import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/prisma';

export class CustomerRepository {
  static async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        sales: { select: { id: true, totalAmount: true, status: true, createdAt: true } },
        promissoryNotes: { select: { id: true, totalAmount: true, status: true, dueDate: true } },
      },
    });
  }

  static async findMany(skip: number, take: number) {
    return prisma.customer.findMany({
      where: { deletedAt: null },
      skip,
      take,
      orderBy: [{ name: 'asc' }],
      include: {
        sales: { select: { totalAmount: true, status: true, createdAt: true } },
      },
    });
  }

  static async count() {
    return prisma.customer.count({ where: { deletedAt: null } });
  }

  static async findByCpf(cpf: string) {
    return prisma.customer.findFirst({ where: { cpf } });
  }

  static async create(data: Prisma.CustomerCreateInput) {
    return prisma.customer.create({ data });
  }

  static async search(term: string, digitOnly: string) {
    return prisma.customer.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          { cpf: { contains: digitOnly, mode: 'insensitive' } },
          { phone: { contains: digitOnly, mode: 'insensitive' } },
        ],
      },
      orderBy: [{ name: 'asc' }],
    });
  }

  static async update(id: string, data: Prisma.CustomerUpdateInput) {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  static async getNotesByCustomerId(customerId: string) {
    return prisma.promissoryNote.findMany({
      where: { customerId },
      include: { sale: { include: { items: true } } },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  static async findUnique(id: string) {
    return prisma.customer.findUnique({ where: { id } });
  }
}
