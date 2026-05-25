import { db } from "../src/db";
import { users } from "../src/db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function hashExistingPasswords() {
  console.log("Starting password migration...");
  
  try {
    const allUsers = await db.select().from(users);
    
    console.log(`Found ${allUsers.length} users`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const user of allUsers) {
      if (!user.password) {
        console.log(`Skipping user ${user.email} - no password`);
        skipped++;
        continue;
      }
      
      const isAlreadyHashed = user.password.startsWith("$2b$") || user.password.startsWith("$2a$");
      
      if (isAlreadyHashed) {
        console.log(`Skipping user ${user.email} - already hashed`);
        skipped++;
        continue;
      }
      
      console.log(`Hashing password for user ${user.email}`);
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));
      
      updated++;
    }
    
    console.log(`\nMigration complete!`);
    console.log(`Updated: ${updated} users`);
    console.log(`Skipped: ${skipped} users`);
    
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

hashExistingPasswords();
