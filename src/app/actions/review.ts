"use server";

import { db } from "@/db";
import { reviews, products, customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getReviews() {
  return await db
    .select({
      id: reviews.id,
      product: products.name,
      customer: customers.name,
      rating: reviews.rating,
      comment: reviews.comment,
      date: reviews.date,
      status: reviews.status,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .leftJoin(customers, eq(reviews.customerId, customers.id));
}

export async function updateReviewStatus(id: string, status: string) {
  await db.update(reviews).set({ status }).where(eq(reviews.id, id));
  revalidatePath("/admin/reviews");
}

export async function deleteReview(id: string) {
  await db.delete(reviews).where(eq(reviews.id, id));
  revalidatePath("/admin/reviews");
}
