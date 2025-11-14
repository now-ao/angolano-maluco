import { db, STORES } from '@/lib/db/indexedDB';
import { Account, AccountSchema, AccountTypeSchema } from '@/lib/db/schema';

export const accountService = {
  async getAll(): Promise<Account[]> {
    const accounts = await db.getAll<Account>(STORES.ACCOUNTS);
    return accounts.sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
  },

  async getById(id: string): Promise<Account | undefined> {
    return db.get<Account>(STORES.ACCOUNTS, id);
  },

  async getByType(type: 'receivable' | 'payable'): Promise<Account[]> {
    return db.getByIndex<Account>(STORES.ACCOUNTS, 'type', type);
  },

  async getByStatus(status: Account['status']): Promise<Account[]> {
    return db.getByIndex<Account>(STORES.ACCOUNTS, 'status', status);
  },

  async getReceivables(): Promise<Account[]> {
    return this.getByType('receivable');
  },

  async getPayables(): Promise<Account[]> {
    return this.getByType('payable');
  },

  async getPendingReceivables(): Promise<Account[]> {
    const accounts = await this.getReceivables();
    return accounts.filter(a => a.status === 'pending');
  },

  async getPendingPayables(): Promise<Account[]> {
    const accounts = await this.getPayables();
    return accounts.filter(a => a.status === 'pending');
  },

  async getOverdue(): Promise<Account[]> {
    const accounts = await this.getAll();
    const now = new Date();
    return accounts.filter(a => 
      (a.status === 'pending' || a.status === 'overdue') && 
      new Date(a.due_date) < now
    );
  },

  async create(data: Omit<Account, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<string> {
    const now = new Date().toISOString();
    const account: Account = {
      ...data,
      id: crypto.randomUUID(),
      status: 'pending',
      created_at: now,
      updated_at: now,
    };

    AccountSchema.parse(account);
    return db.add(STORES.ACCOUNTS, account);
  },

  async update(id: string, data: Partial<Omit<Account, 'id' | 'created_at'>>): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Conta não encontrada');
    }

    const updated: Account = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
    };

    AccountSchema.parse(updated);
    return db.update(STORES.ACCOUNTS, updated);
  },

  async pay(id: string, paymentMethod: Account['payment_method']): Promise<void> {
    const account = await this.getById(id);
    if (!account) {
      throw new Error('Conta não encontrada');
    }

    if (account.status === 'paid') {
      throw new Error('Conta já paga');
    }

    if (account.status === 'cancelled') {
      throw new Error('Conta cancelada');
    }

    await this.update(id, {
      status: 'paid',
      paid_date: new Date().toISOString(),
      payment_method: paymentMethod,
    });
  },

  async cancel(id: string): Promise<void> {
    await this.update(id, { status: 'cancelled' });
  },

  async updateOverdueStatus(): Promise<void> {
    const pending = await this.getByStatus('pending');
    const now = new Date();

    for (const account of pending) {
      if (new Date(account.due_date) < now) {
        await this.update(account.id, { status: 'overdue' });
      }
    }
  },

  async getTotalReceivable(): Promise<number> {
    const accounts = await this.getPendingReceivables();
    return accounts.reduce((sum, acc) => sum + acc.amount, 0);
  },

  async getTotalPayable(): Promise<number> {
    const accounts = await this.getPendingPayables();
    return accounts.reduce((sum, acc) => sum + acc.amount, 0);
  },

  async getCashFlow(startDate: string, endDate: string): Promise<{ income: number; expenses: number }> {
    const accounts = await this.getAll();
    const start = new Date(startDate);
    const end = new Date(endDate);

    const income = accounts
      .filter(a => 
        a.type === 'receivable' && 
        a.status === 'paid' && 
        a.paid_date &&
        new Date(a.paid_date) >= start && 
        new Date(a.paid_date) <= end
      )
      .reduce((sum, acc) => sum + acc.amount, 0);

    const expenses = accounts
      .filter(a => 
        a.type === 'payable' && 
        a.status === 'paid' && 
        a.paid_date &&
        new Date(a.paid_date) >= start && 
        new Date(a.paid_date) <= end
      )
      .reduce((sum, acc) => sum + acc.amount, 0);

    return { income, expenses };
  },
};
