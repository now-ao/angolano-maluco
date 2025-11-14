import { db, STORES } from '../db/indexedDB';
import type { Purchase, StockMovement } from '../db/schema';

export const purchaseService = {
  async create(purchase: Omit<Purchase, 'id' | 'purchase_number' | 'created_at' | 'updated_at'>): Promise<Purchase> {
    const allPurchases = await db.getAll<Purchase>(STORES.PURCHASES);
    const maxNumber = allPurchases.reduce((max, p) => Math.max(max, p.purchase_number), 0);
    
    const newPurchase: Purchase = {
      ...purchase,
      id: crypto.randomUUID(),
      purchase_number: maxNumber + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await db.add(STORES.PURCHASES, newPurchase);
    return newPurchase;
  },

  async update(id: string, data: Partial<Purchase>): Promise<void> {
    const existing = await db.get<Purchase>(STORES.PURCHASES, id);
    if (!existing) throw new Error('Compra não encontrada');
    
    const updated: Purchase = {
      ...existing,
      ...data,
      id: existing.id,
      purchase_number: existing.purchase_number,
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
    };
    
    await db.update(STORES.PURCHASES, updated);
  },

  async receivePurchase(id: string, userId: string): Promise<void> {
    const purchase = await db.get<Purchase>(STORES.PURCHASES, id);
    if (!purchase) throw new Error('Compra não encontrada');
    if (purchase.status !== 'approved') throw new Error('Apenas compras aprovadas podem ser recebidas');

    // Update purchase status
    const updated: Purchase = {
      ...purchase,
      status: 'received',
      received_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await db.update(STORES.PURCHASES, updated);

    // Update stock for each item
    for (const item of purchase.items) {
      const product = await db.get(STORES.PRODUCTS, item.product_id);
      if (product && typeof product === 'object' && 'stock_quantity' in product) {
        const updatedProduct = {
          ...product,
          stock_quantity: (product.stock_quantity as number) + item.quantity,
          updated_at: new Date().toISOString(),
        };
        await db.update(STORES.PRODUCTS, updatedProduct);

        // Create stock movement
        const movement: StockMovement = {
          id: crypto.randomUUID(),
          product_id: item.product_id,
          type: 'in',
          quantity: item.quantity,
          unit_cost: item.unit_price,
          reason: `Entrada de compra #${purchase.purchase_number}`,
          reference_id: purchase.id,
          user_id: userId,
          created_at: new Date().toISOString(),
        };
        await db.add(STORES.STOCK_MOVEMENTS, movement);
      }
    }
  },

  async delete(id: string): Promise<void> {
    await db.delete(STORES.PURCHASES, id);
  },

  async getById(id: string): Promise<Purchase | undefined> {
    return db.get<Purchase>(STORES.PURCHASES, id);
  },

  async getAll(): Promise<Purchase[]> {
    const purchases = await db.getAll<Purchase>(STORES.PURCHASES);
    return purchases.sort((a, b) => b.purchase_number - a.purchase_number);
  },

  async getBySupplier(supplierId: string): Promise<Purchase[]> {
    return db.getByIndex<Purchase>(STORES.PURCHASES, 'supplier_id', supplierId);
  },
};
