"use server";

import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTestimonials() {
  return await db.select().from(testimonials).orderBy(asc(testimonials.order));
}

export async function getActiveTestimonials() {
  return await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.isActive, true))
    .orderBy(asc(testimonials.order));
}

export async function getTestimonialById(id: string) {
  const result = await db.select().from(testimonials).where(eq(testimonials.id, id));
  return result[0] || null;
}

export async function createTestimonial(data: {
  review: string;
  authorName: string;
  authorRole: string;
  authorImg: string;
  rating?: number;
  order?: number;
  isActive?: boolean;
}) {
  await db.insert(testimonials).values({
    ...data,
    rating: data.rating ?? 5,
    order: data.order ?? 0,
    isActive: data.isActive ?? true,
  });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function updateTestimonial(
  id: string,
  data: {
    review?: string;
    authorName?: string;
    authorRole?: string;
    authorImg?: string;
    rating?: number;
    order?: number;
    isActive?: boolean;
  }
) {
  await db
    .update(testimonials)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(testimonials.id, id));
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function deleteTestimonial(id: string) {
  await db.delete(testimonials).where(eq(testimonials.id, id));
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}
