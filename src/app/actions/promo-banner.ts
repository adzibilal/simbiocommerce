"use server";

import { db } from "@/db";
import { promoBanners } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPromoBanners() {
  return await db.select().from(promoBanners).orderBy(asc(promoBanners.order));
}

export async function getActivePromoBanners() {
  return await db
    .select()
    .from(promoBanners)
    .where(eq(promoBanners.isActive, true))
    .orderBy(asc(promoBanners.order));
}

export async function getPromoBannerById(id: string) {
  const result = await db.select().from(promoBanners).where(eq(promoBanners.id, id));
  return result[0] || null;
}

export async function createPromoBanner(data: {
  title: string;
  subtitle: string;
  description?: string | null;
  buttonText: string;
  buttonLink: string;
  imageUrl?: string | null;
  bgColor?: string;
  buttonColor?: string;
  layout?: string;
  linkType?: string;
  productId?: string | null;
  isNewTab?: boolean;
  order?: number;
  isActive?: boolean;
}) {
  await db.insert(promoBanners).values({
    ...data,
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    bgColor: data.bgColor || "#F5F5F7",
    buttonColor: data.buttonColor || "blue",
    layout: data.layout || "big",
    linkType: data.linkType || "custom",
    productId: data.productId || null,
    isNewTab: data.isNewTab ?? false,
    order: data.order ?? 0,
    isActive: data.isActive ?? true,
  });
  revalidatePath("/admin/hero-banner");
  revalidatePath("/");
}

export async function updatePromoBanner(
  id: string,
  data: {
    title?: string;
    subtitle?: string;
    description?: string | null;
    buttonText?: string;
    buttonLink?: string;
    imageUrl?: string | null;
    bgColor?: string;
    buttonColor?: string;
    layout?: string;
    linkType?: string;
    productId?: string | null;
    isNewTab?: boolean;
    order?: number;
    isActive?: boolean;
  }
) {
  await db
    .update(promoBanners)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(promoBanners.id, id));
  revalidatePath("/admin/hero-banner");
  revalidatePath("/");
}

export async function deletePromoBanner(id: string) {
  await db.delete(promoBanners).where(eq(promoBanners.id, id));
  revalidatePath("/admin/hero-banner");
  revalidatePath("/");
}
