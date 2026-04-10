import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerService } from './customers.service';
import { CustomerRepository } from './customers.repository';
import { AuditLogRepository } from '../audit-log/audit-log.repository';

vi.mock('./customers.repository');
vi.mock('../audit-log/audit-log.repository');

describe('CustomerService', () => {
  const testUserId = 'test-admin-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a customer successfully', async () => {
    vi.mocked(CustomerRepository.findByCpf).mockResolvedValue(null);
    vi.mocked(CustomerRepository.create).mockResolvedValue({
      id: 'cust-id',
      name: 'Test Customer',
      cpf: '12345678900',
      phone: '11999999999',
      email: 'customer@test.com',
      address: null,
      isVip: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    });
    vi.mocked(AuditLogRepository.create).mockResolvedValue({} as any);

    const customer = await CustomerService.create({
      name: 'Test Customer',
      cpf: '12345678900',
      phone: '11999999999',
      email: 'customer@test.com',
    }, testUserId);

    expect(customer).toBeDefined();
    expect(customer.name).toBe('Test Customer');
    expect(customer.cpf).toBe('12345678900');
  });

  it('should not create duplicate CPF', async () => {
    vi.mocked(CustomerRepository.findByCpf).mockResolvedValue({
      id: 'existing-id', cpf: '12345678900', name: 'Existing'
    } as any);

    await expect(
      CustomerService.create({
        name: 'Another Customer',
        cpf: '12345678900',
      }, testUserId)
    ).rejects.toThrow('Customer with this CPF already exists');
  });

  it('should search customers by name', async () => {
    vi.mocked(CustomerRepository.search).mockResolvedValue([
      { name: 'Test Customer', id: '1' } as any
    ]);

    const results = await CustomerService.search('Test');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('Test');
  });

  it('should list customers with pagination', async () => {
    vi.mocked(CustomerRepository.findMany).mockResolvedValue([]);
    vi.mocked(CustomerRepository.count).mockResolvedValue(0);

    const result = await CustomerService.listAll({ page: 1, limit: 10 });
    expect(result.data).toBeDefined();
    expect(result.pagination).toBeDefined();
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(10);
  });
});