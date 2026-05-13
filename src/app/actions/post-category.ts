"use server";

import { db } from "@/db";
import { postCategories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPostCategories() {
  try {
    return await db.select().from(postCategories);
  } catch (error) {
    console.error("Failed to fetch post categories:", error);
    return [];
  }
}

export async function createPostCategory(data: { name: string; slug: string }) {
  try {
    await db.insert(postCategories).values(data);
    revalidatePath("/admin/posts");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, error: "Category slug already exists!" };
    }
    return { success: false, error: error.message || "Failed to create category" };
  }
}

export async function updatePostCategory(id: string, data: { name?: string; slug?: string }) {
  try {
    await db.update(postCategories).set(data).where(eq(postCategories.id, id));
    revalidatePath("/admin/posts");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, error: "Category slug already exists!" };
    }
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function deletePostCategory(id: string) {
  try {
    await db.delete(postCategories).where(eq(postCategories.id, id));
    revalidatePath("/admin/posts");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category" };
  }
}
