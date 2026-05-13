"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
