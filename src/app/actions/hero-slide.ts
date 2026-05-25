"use server";

import { db } from "@/db";
import { heroSlides } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getHeroSlides() {
  return await db.select().from(heroSlides).orderBy(asc(heroSlides.order));
}

export async function getActiveHeroSlides() {
  return await db
    .select()
    .from(heroSlides)
    .where(eq(heroSlides.isActive, true))
    .orderBy(asc(heroSlides.order));
}

export async function getHeroSlideById(id: string) {
  const result = await db.select().from(heroSlides).where(eq(heroSlides.id, id));
  return result[0] || null;
}

export async function createHeroSlide(data: {
  imageUrl: string;
  link: string;
  linkType?: string;
  productId?: string | null;
  isNewTab?: boolean;
  order: number;
  isActive?: boolean;
}) {
  await db.insert(heroSlides).values({
    ...data,
    productId: data.productId || null,
    linkType: data.linkType || "custom",
    isNewTab: data.isNewTab ?? false,
    isActive: data.isActive ?? true,
  });
  revalidatePath("/admin/hero-slider");
  revalidatePath("/");
}

export async function updateHeroSlide(
  id: string,
  data: {
    imageUrl?: string;
    link?: string;
    linkType?: string;
    productId?: string | null;
    isNewTab?: boolean;
    order?: number;
    isActive?: boolean;
  }
) {
  await db
    .update(heroSlides)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(heroSlides.id, id));
  revalidatePath("/admin/hero-slider");
  revalidatePath("/");
}

export async function deleteHeroSlide(id: string) {
  await db.delete(heroSlides).where(eq(heroSlides.id, id));
  revalidatePath("/admin/hero-slider");
  revalidatePath("/");
}
