import { db, STORES } from '@/lib/db/indexedDB';
import { Invoice, InvoiceSchema, InvoiceStatus } from '@/lib/db/schema';
import { clientService } from './clientService';

export const invoiceService = {
  async getAll(): Promise<Invoice[]> {
    const invoices = await db.getAll<Invoice>(STORES.INVOICES);
    return invoices.sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime());
  },

  async getById(id: string): Promise<Invoice | undefined> {
    return db.get<Invoice>(STORES.INVOICES, id);
  },

  async getByClient(clientId: string): Promise<Invoice[]> {
    return db.getByIndex<Invoice>(STORES.INVOICES, 'client_id', clientId);
  },

  async getByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    return db.getByIndex<Invoice>(STORES.INVOICES, 'status', status);
  },

  async getOverdue(): Promise<Invoice[]> {
    const invoices = await this.getAll();
    const now = new Date();
    return invoices.filter(inv => 
      inv.status === 'pending' && 
      new Date(inv.due_date) < now
    );
  },

  async getNextInvoiceNumber(): Promise<number> {
    const invoices = await db.getAll<Invoice>(STORES.INVOICES);
    if (invoices.length === 0) return 1;
    return Math.max(...invoices.map(i => i.invoice_number)) + 1;
  },

  async create(data: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at' | 'paid_amount' | 'status'>): Promise<string> {
    const now = new Date().toISOString();
    const invoice: Invoice = {
      ...data,
      id: crypto.randomUUID(),
      invoice_number: await this.getNextInvoiceNumber(),
      paid_amount: 0,
      status: 'pending',
      created_at: now,
      updated_at: now,
    };

    InvoiceSchema.parse(invoice);
    return db.add(STORES.INVOICES, invoice);
  },

  async update(id: string, data: Partial<Omit<Invoice, 'id' | 'invoice_number' | 'created_at'>>): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Fatura não encontrada');
    }

    const updated: Invoice = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
    };

    InvoiceSchema.parse(updated);
    return db.update(STORES.INVOICES, updated);
  },

  async pay(id: string, amount: number, paymentMethod: Invoice['payment_method']): Promise<void> {
    const invoice = await this.getById(id);
    if (!invoice) {
      throw new Error('Fatura não encontrada');
    }

    if (invoice.status === 'paid') {
      throw new Error('Fatura já paga');
    }

    if (invoice.status === 'cancelled') {
      throw new Error('Fatura cancelada');
    }

    const newPaidAmount = invoice.paid_amount + amount;
    if (newPaidAmount > invoice.amount) {
      throw new Error('Valor do pagamento excede o valor da fatura');
    }

    const newStatus: InvoiceStatus = newPaidAmount >= invoice.amount ? 'paid' : 'pending';

    await this.update(id, {
      paid_amount: newPaidAmount,
      status: newStatus,
      payment_method: paymentMethod,
    });

    // Update client debt
    await clientService.updateDebt(invoice.client_id, -amount);
  },

  async cancel(id: string): Promise<void> {
    const invoice = await this.getById(id);
    if (!invoice) {
      throw new Error('Fatura não encontrada');
    }

    if (invoice.status === 'paid') {
      throw new Error('Não é possível cancelar fatura paga');
    }

    await this.update(id, { status: 'cancelled' });

    // Update client debt if had any paid amount
    if (invoice.paid_amount > 0) {
      await clientService.updateDebt(invoice.client_id, invoice.paid_amount);
    }
  },

  async updateOverdueStatus(): Promise<void> {
    const invoices = await this.getByStatus('pending');
    const now = new Date();

    for (const invoice of invoices) {
      if (new Date(invoice.due_date) < now) {
        await this.update(invoice.id, { status: 'overdue' });
      }
    }
  },
};
