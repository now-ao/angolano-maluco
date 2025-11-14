import { db, STORES } from '../db/indexedDB';
import type { Expense, CashTransaction } from '../db/schema';

export const expenseService = {
  async create(expense: Omit<Expense, 'id' | 'created_at'>, cashRegisterId?: string): Promise<Expense> {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    
    await db.add(STORES.EXPENSES, newExpense);

    // If cash register is provided, create transaction
    if (cashRegisterId) {
      const transaction: CashTransaction = {
        id: crypto.randomUUID(),
        cash_register_id: cashRegisterId,
        type: 'expense',
        amount: -expense.amount,
        payment_method: expense.payment_method,
        description: `Despesa: ${expense.description}`,
        reference_id: newExpense.id,
        created_at: new Date().toISOString(),
      };
      await db.add(STORES.CASH_TRANSACTIONS, transaction);

      // Update cash register total expenses
      const cashRegister = await db.get(STORES.CASH_REGISTERS, cashRegisterId);
      if (cashRegister && typeof cashRegister === 'object' && 'total_expenses' in cashRegister) {
        const updated = {
          ...cashRegister,
          total_expenses: (cashRegister.total_expenses as number) + expense.amount,
        };
        await db.update(STORES.CASH_REGISTERS, updated);
      }
    }

    return newExpense;
  },

  async delete(id: string): Promise<void> {
    await db.delete(STORES.EXPENSES, id);
  },

  async getById(id: string): Promise<Expense | undefined> {
    return db.get<Expense>(STORES.EXPENSES, id);
  },

  async getAll(): Promise<Expense[]> {
    const expenses = await db.getAll<Expense>(STORES.EXPENSES);
    return expenses.sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    const all = await db.getAll<Expense>(STORES.EXPENSES);
    return all.filter(e => e.expense_date >= startDate && e.expense_date <= endDate);
  },

  async getByCategory(category: string): Promise<Expense[]> {
    return db.getByIndex<Expense>(STORES.EXPENSES, 'category', category);
  },

  async getTotalByCategory(): Promise<Record<string, number>> {
    const all = await db.getAll<Expense>(STORES.EXPENSES);
    return all.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  },
};
