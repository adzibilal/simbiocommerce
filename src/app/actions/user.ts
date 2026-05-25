"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

export async function updateUserProfile(userId: string, data: {
  name?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  image?: string;
}) {
  try {
    await db.update(users)
      .set(data)
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
  try {
    const existingUser = await db.select().from(users).where(eq(users.email, data.email));
    
    if (existingUser.length > 0) {
      return { success: false, error: "Email already registered" };
    }
    
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    await db.insert(users).values({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Failed to register user:", error);
    return { success: false, error: "Failed to register user" };
  }
}
