import { Customer, PromissoryNote, SaleStatus } from './types';

export const APP_NAME = "IWR Lojas";

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Ismael Silva',
    cpf: '123.456.789-00',
    phone: '5511999999999',
    email: 'ismael@example.com',
    address: 'Rua das Flores, 123, Centro',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Ana Pereira',
    cpf: '987.654.321-11',
    phone: '5511988888888',
    email: 'ana@example.com',
    address: 'Av. Brasil, 456, Jardins',
    createdAt: new Date().toISOString()
  }
];

// Helper to generate some initial data relative to "today"
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

export const MOCK_NOTES: PromissoryNote[] = [
  {
    id: '1001',
    customerId: '1',
    customerName: 'Ismael Silva',
    customerPhone: '5511999999999',
    customerCpf: '123.456.789-00',
    items: [{ id: 'p1', description: 'Camisa Polo Premium', price: 150.00, quantity: 2 }],
    totalAmount: 300.00,
    issueDate: yesterday.toISOString(),
    dueDate: tomorrow.toISOString(), // Due tomorrow
    status: SaleStatus.PENDING,
    whatsappSent: false
  },
  {
    id: '1002',
    customerId: '2',
    customerName: 'Ana Pereira',
    customerPhone: '5511988888888',
    customerCpf: '987.654.321-11',
    items: [{ id: 'p2', description: 'Conjunto Utensílios Inox', price: 450.00, quantity: 1 }],
    totalAmount: 450.00,
    issueDate: yesterday.toISOString(),
    dueDate: yesterday.toISOString(), // Overdue
    status: SaleStatus.OVERDUE,
    whatsappSent: true
  }
];