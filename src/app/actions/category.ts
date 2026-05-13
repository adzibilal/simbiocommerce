"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  return await db.select().from(categories);
}

export async function getCategoryById(id: string) {
  const result = await db.select().from(categories).where(eq(categories.id, id));
  return result[0] || null;
}

export async function createCategory(data: { name: string; slug: string }) {
  await db.insert(categories).values(data);
  revalidatePath("/admin/categories");
}

export async function updateCategory(id: string, data: { name?: string; slug?: string }) {
  await db.update(categories).set(data).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
}
