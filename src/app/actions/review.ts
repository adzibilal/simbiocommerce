"use server";

import { db } from "@/db";
import { reviews, products, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getReviews() {
  return await db
    .select({
      id: reviews.id,
      product: products.name,
      customer: users.name,
      rating: reviews.rating,
      comment: reviews.comment,
      date: reviews.date,
      status: reviews.status,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .leftJoin(users, eq(reviews.customerId, users.id));
}

export async function updateReviewStatus(id: string, status: string) {
  await db.update(reviews).set({ status }).where(eq(reviews.id, id));
  revalidatePath("/admin/reviews");
  revalidatePath("/shop-details", "layout");
  revalidatePath("/", "layout");
}

export async function deleteReview(id: string) {
  await db.delete(reviews).where(eq(reviews.id, id));
  revalidatePath("/admin/reviews");
}

export async function getProductReviews(productId: string) {
  return await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      imageUrl: reviews.imageUrl,
      date: reviews.date,
      customerName: users.name,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.customerId, users.id))
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")));
}

export async function submitReview(data: {
  productId: string;
  orderId: string;
  customerId: string;
  rating: number;
  comment: string;
  imageUrl?: string;
}) {
  // Prevent duplicate reviews for same product+order+customer
  const existing = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(
      and(
        eq(reviews.productId, data.productId),
        eq(reviews.orderId, data.orderId),
        eq(reviews.customerId, data.customerId),
      )
    )
    .limit(1);
  if (existing.length > 0) {
    return { success: false, error: "Kamu sudah memberikan ulasan untuk produk ini." };
  }
  await db.insert(reviews).values({
    productId: data.productId,
    orderId: data.orderId,
    customerId: data.customerId,
    rating: data.rating,
    comment: data.comment,
    imageUrl: data.imageUrl ?? null,
    status: "pending",
  });
  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function getOrderReviews(orderId: string, customerId: string) {
  return await db
    .select({ productId: reviews.productId })
    .from(reviews)
    .where(and(eq(reviews.orderId, orderId), eq(reviews.customerId, customerId)));
}
