import { db, STORES } from '../db/indexedDB';
import type { Supplier } from '../db/schema';

export const supplierService = {
  async create(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const newSupplier: Supplier = {
      ...supplier,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await db.add(STORES.SUPPLIERS, newSupplier);
    return newSupplier;
  },

  async update(id: string, data: Partial<Supplier>): Promise<void> {
    const existing = await db.get<Supplier>(STORES.SUPPLIERS, id);
    if (!existing) throw new Error('Fornecedor não encontrado');
    
    const updated: Supplier = {
      ...existing,
      ...data,
      id: existing.id,
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
    };
    await db.update(STORES.SUPPLIERS, updated);
  },

  async delete(id: string): Promise<void> {
    await db.delete(STORES.SUPPLIERS, id);
  },

  async getById(id: string): Promise<Supplier | undefined> {
    return db.get<Supplier>(STORES.SUPPLIERS, id);
  },

  async getAll(): Promise<Supplier[]> {
    return db.getAll<Supplier>(STORES.SUPPLIERS);
  },

  async getActive(): Promise<Supplier[]> {
    const all = await db.getAll<Supplier>(STORES.SUPPLIERS);
    return all.filter(s => s.active);
  },
};
