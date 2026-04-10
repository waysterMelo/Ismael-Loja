import * as bcrypt from 'bcrypt';
import { z } from 'zod';
import { paginate, PaginationParams } from '../../shared/pagination';
import { UserRepository } from './users.repository';
import { AuditLogRepository } from '../audit-log/audit-log.repository';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(255),
  role: z.enum(['ADMIN', 'OPERATOR']).default('OPERATOR'),
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  email: z.string().email('Invalid email').max(255).optional(),
  role: z.enum(['ADMIN', 'OPERATOR']).optional(),
});

export class UserService {
  static async getById(id: string) {
    const user = await UserRepository.findById(id);

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    return user;
  }

  static async listAll(pagination: PaginationParams) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserRepository.findMany(skip, limit),
      UserRepository.count(),
    ]);

    return {
      data: users,
      pagination: paginate({ page, limit }, total),
    };
  }

  static async create(data: { name: string; email: string; password: string; role?: 'ADMIN' | 'OPERATOR' }, userId: string) {
    const parsed = createUserSchema.parse(data);

    // Verificar se email já existe
    const existingEmail = await UserRepository.findByEmail(parsed.email);

    if (existingEmail) {
      throw Object.assign(new Error('User with this email already exists'), { statusCode: 409 });
    }

    // Hash da senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(parsed.password, saltRounds);

    const user = await UserRepository.create({
      name: parsed.name,
      email: parsed.email,
      passwordHash,
      role: parsed.role,
      active: true,
    });

    // Audit log
    await AuditLogRepository.create({
      userId,
      action: 'CREATE_USER',
      entity: 'User',
      entityId: user.id,
      payload: JSON.stringify({ name: user.name, email: user.email, role: user.role }),
    });

    return user;
  }

  static async update(id: string, data: { name?: string; email?: string; role?: 'ADMIN' | 'OPERATOR' }, userId: string) {
    const existing = await UserRepository.findByIdWithPassword(id);
    if (!existing) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    const parsed = updateUserSchema.parse(data);

    // Verificar se email já existe (se está sendo alterado)
    if (parsed.email && parsed.email !== existing.email) {
      const dup = await UserRepository.findByEmail(parsed.email);

      if (dup) {
        throw Object.assign(new Error('User with this email already exists'), { statusCode: 409 });
      }
    }

    const user = await UserRepository.update(id, {
      name: parsed.name ?? existing.name,
      email: parsed.email ?? existing.email,
      role: parsed.role ?? existing.role,
    });

    // Audit log
    await AuditLogRepository.create({
      userId,
      action: 'UPDATE_USER',
      entity: 'User',
      entityId: user.id,
      payload: JSON.stringify({ name: user.name, email: user.email, role: user.role }),
    });

    return user;
  }

  static async deactivate(id: string, userId: string) {
    const existing = await UserRepository.findByIdWithPassword(id);
    if (!existing) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    // Impedir desativação do próprio usuário
    if (id === userId) {
      throw Object.assign(new Error('You cannot deactivate yourself'), { statusCode: 400 });
    }

    const user = await UserRepository.update(id, { active: false });

    // Audit log
    await AuditLogRepository.create({
      userId,
      action: 'DEACTIVATE_USER',
      entity: 'User',
      entityId: user.id,
      payload: JSON.stringify({ name: user.name, email: user.email }),
    });

    return user;
  }

  static async activate(id: string, userId: string) {
    const existing = await UserRepository.findByIdWithPassword(id);
    if (!existing) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    const user = await UserRepository.update(id, { active: true });

    // Audit log
    await AuditLogRepository.create({
      userId,
      action: 'ACTIVATE_USER',
      entity: 'User',
      entityId: user.id,
      payload: JSON.stringify({ name: user.name, email: user.email }),
    });

    return user;
  }

  static async resetPassword(id: string, newPassword: string, userId: string) {
    const existing = await UserRepository.findByIdWithPassword(id);
    if (!existing) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    // Validar senha
    if (newPassword.length < 6) {
      throw Object.assign(new Error('Password must be at least 6 characters'), { statusCode: 400 });
    }

    // Hash da nova senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const user = await UserRepository.update(id, { passwordHash });

    // Audit log
    await AuditLogRepository.create({
      userId,
      action: 'RESET_PASSWORD',
      entity: 'User',
      entityId: user.id,
      payload: JSON.stringify({ name: user.name, email: user.email }),
    });

    return user;
  }

  static async updateLastLogin(id: string) {
    await UserRepository.updateLastLogin(id).catch(() => {
      // Silenciar erro - não é crítico
    });
  }
}
