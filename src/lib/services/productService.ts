import { db, STORES } from '@/lib/db/indexedDB';
import { Product, ProductSchema } from '@/lib/db/schema';

export const productService = {
  async getAll(): Promise<Product[]> {
    const products = await db.getAll<Product>(STORES.PRODUCTS);
    return products.filter(p => p.active).sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id: string): Promise<Product | undefined> {
    return db.get<Product>(STORES.PRODUCTS, id);
  },

  async getByBarcode(barcode: string): Promise<Product | undefined> {
    const products = await db.getByIndex<Product>(STORES.PRODUCTS, 'barcode', barcode);
    return products.find(p => p.active);
  },

  async getByCode(code: string): Promise<Product | undefined> {
    const products = await db.getByIndex<Product>(STORES.PRODUCTS, 'code', code);
    return products[0];
  },

  async getLowStock(): Promise<Product[]> {
    const products = await this.getAll();
    return products.filter(p => p.stock_quantity <= p.min_stock);
  },

  async create(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const now = new Date().toISOString();
    const product: Product = {
      ...data,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };

    ProductSchema.parse(product);
    
    // Check if code already exists
    const existing = await this.getByCode(product.code);
    if (existing) {
      throw new Error('Código do produto já existe');
    }

    return db.add(STORES.PRODUCTS, product);
  },

  async update(id: string, data: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Produto não encontrado');
    }

    const updated: Product = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
    };

    ProductSchema.parse(updated);
    return db.update(STORES.PRODUCTS, updated);
  },

  async delete(id: string): Promise<void> {
    return this.update(id, { active: false });
  },

  async updateStock(id: string, quantity: number): Promise<void> {
    const product = await this.getById(id);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    const newQuantity = product.stock_quantity + quantity;
    if (newQuantity < 0) {
      throw new Error('Estoque insuficiente');
    }

    return this.update(id, { stock_quantity: newQuantity });
  },

  async searchByName(query: string): Promise<Product[]> {
    const products = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.code.toLowerCase().includes(lowerQuery) ||
      p.barcode?.toLowerCase().includes(lowerQuery)
    );
  },
};
