import { db, STORES } from '@/lib/db/indexedDB';

/**
 * Resets all data in the database except users
 * This is useful for testing and starting fresh
 */
export async function resetAllData() {
  try {
    // Clear all stores except USERS
    await db.clear(STORES.PRODUCTS);
    await db.clear(STORES.CLIENTS);
    await db.clear(STORES.SALES);
    await db.clear(STORES.INVOICES);
    await db.clear(STORES.CASH_REGISTERS);
    await db.clear(STORES.CASH_TRANSACTIONS);
    await db.clear(STORES.ACCOUNTS);
    await db.clear(STORES.STOCK_MOVEMENTS);

    // Clear localStorage
    localStorage.removeItem('sales');
    
    console.log('✅ Database reset successfully - All data cleared except users');
    return true;
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    return false;
  }
}

/**
 * Gets count of all data in the system
 */
export async function getDataCounts() {
  return {
    users: await db.count(STORES.USERS),
    products: await db.count(STORES.PRODUCTS),
    clients: await db.count(STORES.CLIENTS),
    sales: await db.count(STORES.SALES),
    invoices: await db.count(STORES.INVOICES),
    cashRegisters: await db.count(STORES.CASH_REGISTERS),
    cashTransactions: await db.count(STORES.CASH_TRANSACTIONS),
    accounts: await db.count(STORES.ACCOUNTS),
    stockMovements: await db.count(STORES.STOCK_MOVEMENTS),
  };
}
