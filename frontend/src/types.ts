export enum SaleStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR';
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  isVip: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface PromissoryNote {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerCpf: string;
  items: CartItem[];
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  status: SaleStatus;
  notes?: string;
}

export interface DashboardStats {
  totalDue: number;
  notesCount: number;
  overdueCount: number;
  dueTodayCount: number;
}