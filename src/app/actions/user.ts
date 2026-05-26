"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { parseSchema, updateProfileSchema, registerSchema } from "@/lib/validation";

export async function getUserById(id: string) {
  const result = await db
    .select({ id: users.id, name: users.name, email: users.email, phone: users.phone, address: users.address })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function updateUserProfile(userId: string, data: {
  name?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  image?: string;
}) {
  const validation = parseSchema(updateProfileSchema, data);
  if (!validation.success) return { success: false, error: validation.error };

  try {
    await db.update(users)
      .set(validation.data)
      .where(eq(users.id, userId));
      
    revalidatePath("/admin/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const validation = parseSchema(registerSchema, data);
  if (!validation.success) return { success: false, error: validation.error };

  try {
    const existingUser = await db.select().from(users).where(eq(users.email, validation.data.email));
    
    if (existingUser.length > 0) {
      return { success: false, error: "Email already registered" };
    }
    
    const hashedPassword = await bcrypt.hash(validation.data.password, 10);

    await db.insert(users).values({
      id: crypto.randomUUID(),
      name: validation.data.name,
      email: validation.data.email,
      password: hashedPassword,
      role: "customer",
    });
    
    return { success: true };
  } catch (error) {
    console.error("Failed to register user:", error);
    return { success: false, error: "Failed to register user" };
  }
}
