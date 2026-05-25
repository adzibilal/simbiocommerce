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

export async function createCategory(data: {
  name: string;
  slug: string;
  imageUrl?: string | null;
}) {
  await db.insert(categories).values({
    name: data.name,
    slug: data.slug,
    imageUrl: data.imageUrl?.trim() ? data.imageUrl.trim() : null,
  });
  revalidatePath("/admin/categories");
}

export async function updateCategory(
  id: string,
  data: { name?: string; slug?: string; imageUrl?: string | null }
) {
  const patch: { name?: string; slug?: string; imageUrl?: string | null } = { ...data };
  if (data.imageUrl !== undefined) {
    patch.imageUrl = data.imageUrl?.trim() ? data.imageUrl.trim() : null;
  }
  await db.update(categories).set(patch).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
}
