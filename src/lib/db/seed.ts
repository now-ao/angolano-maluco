import { db, STORES } from './indexedDB';
import type { User, Product, Client } from './schema';

export async function seedDatabase() {
  try {
    // Check if already seeded
    const userCount = await db.count(STORES.USERS);
    if (userCount > 0) {
      console.log('Database already seeded');
      return;
    }

    const now = new Date().toISOString();

    // Seed only admin user - no example data
    const adminUser: User = {
      id: crypto.randomUUID(),
      name: 'Administrador',
      email: 'admin@erp.com',
      password: 'admin123', // In production, hash this!
      role: 'admin',
      active: true,
      created_at: now,
      updated_at: now,
    };

    await db.add(STORES.USERS, adminUser);

    console.log('Database seeded successfully with admin user only!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
