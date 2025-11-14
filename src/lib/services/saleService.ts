import { db, STORES } from '@/lib/db/indexedDB';
import { Sale, SaleSchema, StockMovement } from '@/lib/db/schema';
import { productService } from './productService';
import { clientService } from './clientService';

export const saleService = {
  async getAll(): Promise<Sale[]> {
    const sales = await db.getAll<Sale>(STORES.SALES);
    return sales.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getById(id: string): Promise<Sale | undefined> {
    return db.get<Sale>(STORES.SALES, id);
  },

  async getByUser(userId: string): Promise<Sale[]> {
    return db.getByIndex<Sale>(STORES.SALES, 'user_id', userId);
  },

  async getByClient(clientId: string): Promise<Sale[]> {
    return db.getByIndex<Sale>(STORES.SALES, 'client_id', clientId);
  },

  async getNextSaleNumber(): Promise<number> {
    const sales = await db.getAll<Sale>(STORES.SALES);
    if (sales.length === 0) return 1;
    return Math.max(...sales.map(s => s.sale_number)) + 1;
  },

  async getTodaySales(): Promise<Sale[]> {
    const sales = await this.getAll();
    const today = new Date().toISOString().split('T')[0];
    return sales.filter(s => s.created_at.startsWith(today) && s.status === 'completed');
  },

  async getTodayTotal(): Promise<number> {
    const todaySales = await this.getTodaySales();
    return todaySales.reduce((sum, sale) => sum + sale.final_amount, 0);
  },

  async create(data: Omit<Sale, 'id' | 'sale_number' | 'created_at' | 'status'>): Promise<string> {
    const sale: Sale = {
      ...data,
      id: crypto.randomUUID(),
      sale_number: await this.getNextSaleNumber(),
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    SaleSchema.parse(sale);

    // Validate stock availability
    for (const item of sale.items) {
      const product = await productService.getById(item.product_id);
      if (!product) {
        throw new Error(`Produto ${item.product_name} não encontrado`);
      }
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Estoque insuficiente para ${item.product_name}`);
      }
    }

    // Check credit limit for client if payment is on credit
    if (sale.client_id && sale.payment_method === 'bank_transfer') {
      const hasCredit = await clientService.checkCreditLimit(sale.client_id, sale.final_amount);
      if (!hasCredit) {
        throw new Error('Cliente excedeu limite de crédito');
      }
    }

    // Create sale
    const saleId = await db.add(STORES.SALES, sale);

    // Update stock for each item
    for (const item of sale.items) {
      await productService.updateStock(item.product_id, -item.quantity);
      
      // Register stock movement
      const movement: StockMovement = {
        id: crypto.randomUUID(),
        product_id: item.product_id,
        type: 'out',
        quantity: -item.quantity,
        reason: `Venda #${sale.sale_number}`,
        reference_id: sale.id,
        user_id: sale.user_id,
        created_at: new Date().toISOString(),
      };
      await db.add(STORES.STOCK_MOVEMENTS, movement);
    }

    // Update client debt if applicable
    if (sale.client_id && sale.payment_method === 'bank_transfer') {
      await clientService.updateDebt(sale.client_id, sale.final_amount);
    }

    return saleId;
  },

  async cancel(id: string): Promise<void> {
    const sale = await this.getById(id);
    if (!sale) {
      throw new Error('Venda não encontrada');
    }

    if (sale.status === 'cancelled') {
      throw new Error('Venda já cancelada');
    }

    // Restore stock
    for (const item of sale.items) {
      await productService.updateStock(item.product_id, item.quantity);
      
      // Register stock movement
      const movement: StockMovement = {
        id: crypto.randomUUID(),
        product_id: item.product_id,
        type: 'in',
        quantity: item.quantity,
        reason: `Cancelamento venda #${sale.sale_number}`,
        reference_id: sale.id,
        user_id: sale.user_id,
        created_at: new Date().toISOString(),
      };
      await db.add(STORES.STOCK_MOVEMENTS, movement);
    }

    // Update client debt if applicable
    if (sale.client_id && sale.payment_method === 'bank_transfer') {
      await clientService.updateDebt(sale.client_id, -sale.final_amount);
    }

    // Update sale status
    const updated: Sale = {
      ...sale,
      status: 'cancelled',
    };
    
    return db.update(STORES.SALES, updated);
  },
};
