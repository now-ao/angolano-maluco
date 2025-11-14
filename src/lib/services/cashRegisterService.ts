import { db, STORES } from '@/lib/db/indexedDB';
import { CashRegister, CashRegisterSchema, CashTransaction, CashTransactionSchema } from '@/lib/db/schema';

export const cashRegisterService = {
  async getAll(): Promise<CashRegister[]> {
    const registers = await db.getAll<CashRegister>(STORES.CASH_REGISTERS);
    return registers.sort((a, b) => new Date(b.opening_date).getTime() - new Date(a.opening_date).getTime());
  },

  async getById(id: string): Promise<CashRegister | undefined> {
    return db.get<CashRegister>(STORES.CASH_REGISTERS, id);
  },

  async getByUser(userId: string): Promise<CashRegister[]> {
    return db.getByIndex<CashRegister>(STORES.CASH_REGISTERS, 'user_id', userId);
  },

  async getOpenRegister(userId: string): Promise<CashRegister | undefined> {
    const registers = await this.getByUser(userId);
    return registers.find(r => r.status === 'open');
  },

  async open(userId: string, openingBalance: number): Promise<string> {
    // Check if user already has an open register
    const existing = await this.getOpenRegister(userId);
    if (existing) {
      throw new Error('Usuário já possui um caixa aberto');
    }

    const register: CashRegister = {
      id: crypto.randomUUID(),
      user_id: userId,
      opening_date: new Date().toISOString(),
      opening_balance: openingBalance,
      total_sales: 0,
      total_expenses: 0,
      status: 'open',
    };

    CashRegisterSchema.parse(register);
    return db.add(STORES.CASH_REGISTERS, register);
  },

  async close(id: string, closingBalance: number, notes?: string): Promise<void> {
    const register = await this.getById(id);
    if (!register) {
      throw new Error('Caixa não encontrado');
    }

    if (register.status === 'closed') {
      throw new Error('Caixa já está fechado');
    }

    const updated: CashRegister = {
      ...register,
      closing_date: new Date().toISOString(),
      closing_balance: closingBalance,
      status: 'closed',
      notes,
    };

    CashRegisterSchema.parse(updated);
    return db.update(STORES.CASH_REGISTERS, updated);
  },

  async addTransaction(transaction: Omit<CashTransaction, 'id' | 'created_at'>): Promise<string> {
    const register = await this.getById(transaction.cash_register_id);
    if (!register) {
      throw new Error('Caixa não encontrado');
    }

    if (register.status === 'closed') {
      throw new Error('Caixa já está fechado');
    }

    const trans: CashTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    CashTransactionSchema.parse(trans);
    const transId = await db.add(STORES.CASH_TRANSACTIONS, trans);

    // Update register totals
    const updated: CashRegister = { ...register };
    if (trans.type === 'sale' || trans.type === 'deposit') {
      updated.total_sales += trans.amount;
    } else if (trans.type === 'expense' || trans.type === 'withdrawal') {
      updated.total_expenses += Math.abs(trans.amount);
    }

    await db.update(STORES.CASH_REGISTERS, updated);

    return transId;
  },

  async getTransactions(registerId: string): Promise<CashTransaction[]> {
    const transactions = await db.getByIndex<CashTransaction>(
      STORES.CASH_TRANSACTIONS,
      'cash_register_id',
      registerId
    );
    return transactions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async calculateExpectedBalance(registerId: string): Promise<number> {
    const register = await this.getById(registerId);
    if (!register) return 0;

    const transactions = await this.getTransactions(registerId);
    
    let balance = register.opening_balance;
    for (const trans of transactions) {
      if (trans.type === 'sale' || trans.type === 'deposit') {
        balance += trans.amount;
      } else if (trans.type === 'expense' || trans.type === 'withdrawal') {
        balance -= Math.abs(trans.amount);
      }
    }

    return balance;
  },

  async getTodayRegisters(): Promise<CashRegister[]> {
    const registers = await this.getAll();
    const today = new Date().toISOString().split('T')[0];
    return registers.filter(r => r.opening_date.startsWith(today));
  },
};
