"use server";

import { db } from "@/db";
import { wishlists, products, productImages } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import * as crypto from "crypto";

export async function getWishlist(userId: string) {
  const rows = await db
    .select({ productId: wishlists.productId, createdAt: wishlists.createdAt })
    .from(wishlists)
    .where(eq(wishlists.userId, userId));
  return rows;
}

export async function getWishlistProducts(userId: string) {
  const rows = await db
    .select({ productId: wishlists.productId })
    .from(wishlists)
    .where(eq(wishlists.userId, userId));

  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.productId);

  const [prods, allImages] = await Promise.all([
    db.select().from(products).where(inArray(products.id, ids)),
    db.select().from(productImages).where(inArray(productImages.productId, ids)),
  ]);

  return prods.map((p) => {
    const imgs = allImages.filter((i) => i.productId === p.id).sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
    return {
      ...p,
      imageUrl: imgs.find((i) => i.isPrimary)?.imageUrl ?? imgs[0]?.imageUrl ?? undefined,
      images: imgs.map((i) => i.imageUrl),
    };
  });
}

export async function addToWishlist(userId: string, productId: string) {
  try {
    await db.insert(wishlists).values({ id: crypto.randomUUID(), userId, productId }).onConflictDoNothing();
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function removeFromWishlist(userId: string, productId: string) {
  try {
    await db.delete(wishlists).where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function syncWishlistFromLocal(userId: string, productIds: string[]) {
  if (productIds.length === 0) return;
  const values = productIds.map((productId) => ({ id: crypto.randomUUID(), userId, productId }));
  await db.insert(wishlists).values(values).onConflictDoNothing();
}
