"use server";

import { db } from "@/db";
import { heroFeatures } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getHeroFeatures() {
  return await db.select().from(heroFeatures).orderBy(asc(heroFeatures.order));
}

export async function getActiveHeroFeatures() {
  return await db
    .select()
    .from(heroFeatures)
    .where(eq(heroFeatures.isActive, true))
    .orderBy(asc(heroFeatures.order));
}

export async function getHeroFeatureById(id: string) {
  const result = await db.select().from(heroFeatures).where(eq(heroFeatures.id, id));
  return result[0] || null;
}

export async function createHeroFeature(data: {
  imageUrl: string;
  title: string;
  description: string;
  order?: number;
  isActive?: boolean;
}) {
  await db.insert(heroFeatures).values({
    ...data,
    order: data.order ?? 0,
    isActive: data.isActive ?? true,
  });
  revalidatePath("/admin/hero-features");
  revalidatePath("/");
}

export async function updateHeroFeature(
  id: string,
  data: {
    imageUrl?: string;
    title?: string;
    description?: string;
    order?: number;
    isActive?: boolean;
  }
) {
  await db
    .update(heroFeatures)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(heroFeatures.id, id));
  revalidatePath("/admin/hero-features");
  revalidatePath("/");
}

export async function deleteHeroFeature(id: string) {
  await db.delete(heroFeatures).where(eq(heroFeatures.id, id));
  revalidatePath("/admin/hero-features");
  revalidatePath("/");
}
