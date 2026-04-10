import { z } from 'zod';
import { paginate, PaginationParams, PaginatedResult } from '../../shared/pagination';
import { CustomerRepository } from './customers.repository';
import { AuditLogRepository } from '../audit-log/audit-log.repository';

const createCustomerSchema = z.object({
  name: z.string().min(1).max(255),
  cpf: z.string().min(11).max(14).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().max(255).optional(),
  address: z.string().max(500).optional(),
  isVip: z.boolean().optional(),
});

export class CustomerService {
  static async getById(id: string) {
    const customer = await CustomerRepository.findById(id);
    if (!customer) {
      throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
    }
    return customer;
  }

  static async listAll(pagination: PaginationParams) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      CustomerRepository.findMany(skip, limit),
      CustomerRepository.count(),
    ]);

    return {
      data: customers,
      pagination: paginate({ page, limit }, total),
    };
  }

  static async create(data: { name: string; cpf?: string; email?: string; phone?: string; address?: string; isVip?: boolean }, userId: string) {
    const parsed = createCustomerSchema.parse(data);

    if (parsed.cpf) {
      const existing = await CustomerRepository.findByCpf(parsed.cpf.replace(/\D/g, ''));
      if (existing) {
        throw Object.assign(new Error('Customer with this CPF already exists'), { statusCode: 409 });
      }
    }

    const customer = await CustomerRepository.create({
      name: parsed.name,
      cpf: parsed.cpf ? parsed.cpf.replace(/\D/g, '') : null,
      phone: parsed.phone || null,
      email: parsed.email || null,
      address: parsed.address || null,
      isVip: parsed.isVip || false,
    });

    await AuditLogRepository.create({
      userId,
      action: 'CREATE_CUSTOMER',
      entity: 'Customer',
      entityId: customer.id,
      payload: JSON.stringify({ name: customer.name, cpf: customer.cpf }),
    });

    return customer;
  }

  static async search(query: string) {
    const term = query.toLowerCase();
    const digitOnly = query.replace(/\D/g, '');
    return CustomerRepository.search(term, digitOnly);
  }

  static async update(id: string, data: { name?: string; cpf?: string; phone?: string; email?: string; address?: string; isVip?: boolean }, userId: string) {
    const existing = await CustomerRepository.findUnique(id);
    if (!existing) {
      throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
    }

    if (data.cpf && data.cpf.replace(/\D/g, '') !== existing.cpf?.replace(/\D/g, '')) {
      const dup = await CustomerRepository.findByCpf(data.cpf.replace(/\D/g, ''));
      if (dup) {
        throw Object.assign(new Error('Customer with this CPF already exists'), { statusCode: 409 });
      }
    }

    const customer = await CustomerRepository.update(id, {
      name: data.name ?? existing.name,
      cpf: data.cpf !== undefined ? data.cpf.replace(/\D/g, '') : existing.cpf,
      phone: data.phone ?? existing.phone,
      email: data.email ?? existing.email,
      address: data.address ?? existing.address,
      isVip: data.isVip !== undefined ? data.isVip : existing.isVip,
    });

    await AuditLogRepository.create({
      userId,
      action: 'UPDATE_CUSTOMER',
      entity: 'Customer',
      entityId: customer.id,
      payload: JSON.stringify({ name: customer.name, cpf: customer.cpf }),
    });

    return customer;
  }

  static async getNotesByCustomerId(customerId: string) {
    return CustomerRepository.getNotesByCustomerId(customerId);
  }

  static async softDelete(id: string, userId: string) {
    const existing = await CustomerRepository.findUnique(id);
    if (!existing) {
      throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
    }

    if (existing.deletedAt) {
      throw Object.assign(new Error('Customer already deleted'), { statusCode: 400 });
    }

    const customer = await CustomerRepository.update(id, { deletedAt: new Date() });

    await AuditLogRepository.create({
      userId,
      action: 'DELETE_CUSTOMER',
      entity: 'Customer',
      entityId: customer.id,
      payload: JSON.stringify({ name: customer.name, cpf: customer.cpf }),
    });

    return customer;
  }

  static async restore(id: string, userId: string) {
    const existing = await CustomerRepository.findUnique(id);
    if (!existing) {
      throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
    }

    if (!existing.deletedAt) {
      throw Object.assign(new Error('Customer is not deleted'), { statusCode: 400 });
    }

    const customer = await CustomerRepository.update(id, { deletedAt: null });

    await AuditLogRepository.create({
      userId,
      action: 'RESTORE_CUSTOMER',
      entity: 'Customer',
      entityId: customer.id,
      payload: JSON.stringify({ name: customer.name, cpf: customer.cpf }),
    });

    return customer;
  }
}
