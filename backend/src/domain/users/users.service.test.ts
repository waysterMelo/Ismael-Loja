import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './users.service';
import { UserRepository } from './users.repository';
import { AuditLogRepository } from '../audit-log/audit-log.repository';
import { Prisma } from '@prisma/client';

vi.mock('./users.repository');
vi.mock('../audit-log/audit-log.repository');

describe('UserService', () => {
  const testUserId = 'test-admin-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a user successfully', async () => {
    vi.mocked(UserRepository.findByEmail).mockResolvedValue(null);
    const mockUser = {
      id: 'new-id', name: 'Test User', email: 'user@test.com', role: 'OPERATOR' as any,
      active: true, createdAt: new Date(), updatedAt: new Date()
    };
    vi.mocked(UserRepository.create).mockResolvedValue(mockUser);
    vi.mocked(AuditLogRepository.create).mockResolvedValue({} as any);

    const user = await UserService.create({
      name: 'Test User',
      email: 'user@test.com',
      password: 'password123',
      role: 'OPERATOR',
    }, testUserId);

    expect(user).toBeDefined();
    expect(user.name).toBe('Test User');
    expect(user.role).toBe('OPERATOR');
  });

  it('should not create duplicate email', async () => {
    const email = 'duplicate@test.com';
    vi.mocked(UserRepository.findByEmail).mockResolvedValue({ id: 'existing', email } as any);

    await expect(
      UserService.create({
        name: 'Second User',
        email,
        password: 'password123',
      }, testUserId)
    ).rejects.toThrow('User with this email already exists');
  });

  it('should list users with pagination', async () => {
    vi.mocked(UserRepository.findMany).mockResolvedValue([]);
    vi.mocked(UserRepository.count).mockResolvedValue(0);

    const result = await UserService.listAll({ page: 1, limit: 10 });
    expect(result.data).toBeDefined();
    expect(result.pagination).toBeDefined();
  });

  it('should update user', async () => {
    const mockUser = {
      id: 'user-id', name: 'Update Test', email: 'update@test.com', role: 'OPERATOR' as any,
      active: true, createdAt: new Date(), updatedAt: new Date(), passwordHash: 'hash', lastLoginAt: null
    };
    vi.mocked(UserRepository.findByIdWithPassword).mockResolvedValue(mockUser);
    vi.mocked(UserRepository.update).mockResolvedValue({ ...mockUser, name: 'Updated Name' });
    vi.mocked(AuditLogRepository.create).mockResolvedValue({} as any);

    const updated = await UserService.update(
      mockUser.id,
      { name: 'Updated Name' },
      testUserId
    );

    expect(updated.name).toBe('Updated Name');
  });

  it('should deactivate user', async () => {
    const mockUser = {
      id: 'user-id', name: 'Deactivate Test', email: 'deactivate@test.com', role: 'OPERATOR' as any,
      active: true, createdAt: new Date(), updatedAt: new Date(), passwordHash: 'hash', lastLoginAt: null
    };
    vi.mocked(UserRepository.findByIdWithPassword).mockResolvedValue(mockUser);
    vi.mocked(UserRepository.update).mockResolvedValue({ ...mockUser, active: false });
    vi.mocked(AuditLogRepository.create).mockResolvedValue({} as any);

    const deactivated = await UserService.deactivate(mockUser.id, testUserId);
    expect(deactivated.active).toBe(false);
  });

  it('should not deactivate yourself', async () => {
    const mockUser = {
      id: testUserId, name: 'Admin Test', email: 'admin@test.com', role: 'ADMIN' as any,
      active: true, createdAt: new Date(), updatedAt: new Date(), passwordHash: 'hash', lastLoginAt: null
    };
    vi.mocked(UserRepository.findByIdWithPassword).mockResolvedValue(mockUser);

    await expect(
      UserService.deactivate(testUserId, testUserId)
    ).rejects.toThrow('You cannot deactivate yourself');
  });

  it('should reset password', async () => {
    const mockUser = {
      id: 'user-id', name: 'Reset Test', email: 'reset@test.com', role: 'OPERATOR' as any,
      active: true, createdAt: new Date(), updatedAt: new Date(), passwordHash: 'hash', lastLoginAt: null
    };
    vi.mocked(UserRepository.findByIdWithPassword).mockResolvedValue(mockUser);
    vi.mocked(UserRepository.update).mockResolvedValue(mockUser);
    vi.mocked(AuditLogRepository.create).mockResolvedValue({} as any);

    const result = await UserService.resetPassword(mockUser.id, 'newpassword123', testUserId);
    expect(result).toBeDefined();
    expect(result.id).toBe(mockUser.id);
  });

  it('should not reset password with less than 6 characters', async () => {
    const mockUser = {
      id: 'user-id', name: 'Short Password Test', email: 'short@test.com', role: 'OPERATOR' as any,
      active: true, createdAt: new Date(), updatedAt: new Date(), passwordHash: 'hash', lastLoginAt: null
    };
    vi.mocked(UserRepository.findByIdWithPassword).mockResolvedValue(mockUser);

    await expect(
      UserService.resetPassword(mockUser.id, '12345', testUserId)
    ).rejects.toThrow('Password must be at least 6 characters');
  });
});
