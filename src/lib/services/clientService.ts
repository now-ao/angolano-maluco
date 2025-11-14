import { db, STORES } from '@/lib/db/indexedDB';
import { Client, ClientSchema } from '@/lib/db/schema';

export const clientService = {
  async getAll(): Promise<Client[]> {
    const clients = await db.getAll<Client>(STORES.CLIENTS);
    return clients.filter(c => c.active).sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id: string): Promise<Client | undefined> {
    return db.get<Client>(STORES.CLIENTS, id);
  },

  async getByDocument(document: string): Promise<Client | undefined> {
    const clients = await db.getByIndex<Client>(STORES.CLIENTS, 'document', document);
    return clients.find(c => c.active);
  },

  async create(data: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'current_debt'>): Promise<string> {
    const now = new Date().toISOString();
    const client: Client = {
      ...data,
      id: crypto.randomUUID(),
      current_debt: 0,
      created_at: now,
      updated_at: now,
    };

    ClientSchema.parse(client);
    
    // Check if document already exists
    const existing = await this.getByDocument(client.document);
    if (existing) {
      throw new Error('Cliente com este documento já existe');
    }

    return db.add(STORES.CLIENTS, client);
  },

  async update(id: string, data: Partial<Omit<Client, 'id' | 'created_at' | 'current_debt'>>): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Cliente não encontrado');
    }

    const updated: Client = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
    };

    ClientSchema.parse(updated);
    return db.update(STORES.CLIENTS, updated);
  },

  async delete(id: string): Promise<void> {
    return this.update(id, { active: false });
  },

  async updateDebt(id: string, amount: number): Promise<void> {
    const client = await this.getById(id);
    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    const newDebt = client.current_debt + amount;
    if (newDebt < 0) {
      throw new Error('Valor de dívida inválido');
    }

    return this.update(id, { current_debt: newDebt });
  },

  async checkCreditLimit(id: string, amount: number): Promise<boolean> {
    const client = await this.getById(id);
    if (!client) return false;

    return (client.current_debt + amount) <= client.credit_limit;
  },

  async searchByName(query: string): Promise<Client[]> {
    const clients = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.document.toLowerCase().includes(lowerQuery) ||
      c.email?.toLowerCase().includes(lowerQuery)
    );
  },
};
