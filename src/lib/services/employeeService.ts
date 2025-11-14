import { db, STORES } from '../db/indexedDB';
import type { Employee } from '../db/schema';

export const employeeService = {
  async create(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
    const newEmployee: Employee = {
      ...employee,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await db.add(STORES.EMPLOYEES, newEmployee);
    return newEmployee;
  },

  async update(id: string, data: Partial<Employee>): Promise<void> {
    const existing = await db.get<Employee>(STORES.EMPLOYEES, id);
    if (!existing) throw new Error('Funcionário não encontrado');
    
    const updated: Employee = {
      ...existing,
      ...data,
      id: existing.id,
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
    };
    await db.update(STORES.EMPLOYEES, updated);
  },

  async delete(id: string): Promise<void> {
    await db.delete(STORES.EMPLOYEES, id);
  },

  async getById(id: string): Promise<Employee | undefined> {
    return db.get<Employee>(STORES.EMPLOYEES, id);
  },

  async getAll(): Promise<Employee[]> {
    return db.getAll<Employee>(STORES.EMPLOYEES);
  },

  async getActive(): Promise<Employee[]> {
    const all = await db.getAll<Employee>(STORES.EMPLOYEES);
    return all.filter(e => e.active);
  },

  async getByDepartment(department: string): Promise<Employee[]> {
    return db.getByIndex<Employee>(STORES.EMPLOYEES, 'department', department);
  },

  async getTotalPayroll(): Promise<number> {
    const active = await this.getActive();
    return active.reduce((sum, e) => sum + e.salary, 0);
  },
};
