export interface Sale {
  id: string;
  operatorName: string;
  operatorId: string;
  date: string;
  time: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  clientName?: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface SaleItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export type PaymentMethod = 'numerario' | 'tpa' | 'transferencia' | 'multicaixa';

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  iban?: string;
  isActive: boolean;
}

export interface Device {
  id: string;
  name: string;
  type: 'pos' | 'computer' | 'tablet';
  status: 'active' | 'inactive';
  lastSync?: string;
}
