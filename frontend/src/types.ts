export enum SaleStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
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
  whatsappSent?: boolean;
}

export interface DashboardStats {
  totalDue: number;
  notesCount: number;
  overdueCount: number;
  dueTodayCount: number;
}