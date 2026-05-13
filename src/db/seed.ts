import { db } from './index';
import { categories, users } from './schema';

async function seed() {
  try {
    // Seed category
    try {
      await db.insert(categories).values({
        name: 'Electronics',
        slug: 'electronics',
      });
      console.log('Category seeded');
    } catch (e) {
      console.log('Category might already exist');
    }
    
    // Seed user
    try {
      await db.insert(users).values({
        id: crypto.randomUUID(), // Use UUID
        name: 'Admin',
        email: 'admin@simbiospace.com',
        password: 'password',
        role: 'admin',
      });
      console.log('User seeded');
    } catch (e) {
      console.log('User might already exist');
    }
    
    console.log('Seeding completed');
  } catch (error) {
    console.error('Error seeding:', error);
  }
}

seed();
