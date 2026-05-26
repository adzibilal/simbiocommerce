"use server";

import { db } from "@/db";
import { recentlyViewed, products, productImages } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import * as crypto from "crypto";

export async function trackRecentlyViewed(userId: string, productId: string) {
  try {
    const existing = await db.select({ id: recentlyViewed.id })
      .from(recentlyViewed)
      .where(eq(recentlyViewed.userId, userId))
      .limit(100);

    // Update viewedAt if exists, else insert
    const exists = existing.find((r: any) => r.productId === productId);
    if (exists) {
      await db.update(recentlyViewed)
        .set({ viewedAt: new Date().toISOString() })
        .where(eq(recentlyViewed.id, exists.id));
    } else {
      await db.insert(recentlyViewed).values({
        id: crypto.randomUUID(),
        userId,
        productId,
        viewedAt: new Date().toISOString(),
      }).onConflictDoNothing();
    }
  } catch {}
}

export async function getRecentlyViewedProducts(userId: string, limit = 10) {
  const rows = await db
    .select({ productId: recentlyViewed.productId })
    .from(recentlyViewed)
    .where(eq(recentlyViewed.userId, userId))
    .orderBy(desc(recentlyViewed.viewedAt))
    .limit(limit);

  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.productId);

  const [prods, allImages] = await Promise.all([
    db.select().from(products).where(inArray(products.id, ids)),
    db.select().from(productImages).where(inArray(productImages.productId, ids)),
  ]);

  return ids.map((id) => {
    const p = prods.find((x) => x.id === id);
    if (!p) return null;
    const imgs = allImages.filter((i) => i.productId === p.id).sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
    return {
      ...p,
      imageUrl: imgs.find((i) => i.isPrimary)?.imageUrl ?? imgs[0]?.imageUrl ?? undefined,
      images: imgs.map((i) => i.imageUrl),
    };
  }).filter(Boolean);
}

export async function syncRecentlyViewedFromLocal(userId: string, productIds: string[]) {
  if (productIds.length === 0) return;
  const values = productIds.map((productId) => ({
    id: crypto.randomUUID(),
    userId,
    productId,
    viewedAt: new Date().toISOString(),
  }));
  await db.insert(recentlyViewed).values(values).onConflictDoNothing();
}
