"use server";

import { db } from "@/db";
import { seoSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSeoSettings() {
  return await db.select().from(seoSettings);
}

export async function getSeoByRoute(pageRoute: string) {
  const result = await db
    .select()
    .from(seoSettings)
    .where(eq(seoSettings.pageRoute, pageRoute));
  return result[0] || null;
}

export async function saveSeoSetting(data: {
  pageRoute: string;
  pageTitle: string;
  metaTitle: string;
  metaDescription: string;
  keywords?: string | null;
  ogImage?: string | null;
  isActive?: boolean;
}) {
  const existing = await db
    .select()
    .from(seoSettings)
    .where(eq(seoSettings.pageRoute, data.pageRoute));

  if (existing.length > 0) {
    await db
      .update(seoSettings)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(seoSettings.pageRoute, data.pageRoute));
  } else {
    await db.insert(seoSettings).values({
      ...data,
      isActive: data.isActive ?? true,
    });
  }

  revalidatePath("/admin/seo-settings");
  revalidatePath(data.pageRoute);
}

export async function deleteSeoSetting(id: string) {
  await db.delete(seoSettings).where(eq(seoSettings.id, id));
  revalidatePath("/admin/seo-settings");
}
