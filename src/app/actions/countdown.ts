"use server";

import { db } from "@/db";
import { countdownSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCountdownSettings() {
  return await db.select().from(countdownSettings);
}

export async function getActiveCountdown() {
  const result = await db
    .select()
    .from(countdownSettings)
    .where(eq(countdownSettings.isActive, true))
    .limit(1);
  return result[0] || null;
}

export async function getCountdownById(id: string) {
  const result = await db.select().from(countdownSettings).where(eq(countdownSettings.id, id));
  return result[0] || null;
}

export async function createCountdown(data: {
  label?: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  buttonText?: string;
  buttonLink: string;
  endDate: string;
  bgColor?: string;
  buttonColor?: string;
  linkType?: string;
  productId?: string | null;
  isNewTab?: boolean;
  isActive?: boolean;
}) {
  await db.insert(countdownSettings).values({
    ...data,
    label: data.label || "Don't Miss!!",
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    buttonText: data.buttonText || "Check it Out!",
    bgColor: data.bgColor || "#D0E9F3",
    buttonColor: data.buttonColor || "blue",
    linkType: data.linkType || "custom",
    productId: data.productId || null,
    isNewTab: data.isNewTab ?? false,
    isActive: data.isActive ?? true,
  });
  revalidatePath("/admin/countdown");
  revalidatePath("/");
}

export async function updateCountdown(
  id: string,
  data: {
    label?: string;
    title?: string;
    description?: string | null;
    imageUrl?: string | null;
    buttonText?: string;
    buttonLink?: string;
    endDate?: string;
    bgColor?: string;
    buttonColor?: string;
    linkType?: string;
    productId?: string | null;
    isNewTab?: boolean;
    isActive?: boolean;
  }
) {
  await db
    .update(countdownSettings)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(countdownSettings.id, id));
  revalidatePath("/admin/countdown");
  revalidatePath("/");
}

export async function deleteCountdown(id: string) {
  await db.delete(countdownSettings).where(eq(countdownSettings.id, id));
  revalidatePath("/admin/countdown");
  revalidatePath("/");
}
