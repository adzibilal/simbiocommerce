"use server";

import { db } from "@/db";
import { products, stockHistory, productImages } from "@/db/schema";
import { eq, lte, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { LOW_STOCK_THRESHOLD } from "@/lib/inventory-config";

// ─── Get all products with stock info ────────────────────────────────────────
export async function getInventory() {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      stock: products.stock,
      isActive: products.isActive,
      imageUrl: productImages.imageUrl,
    })
    .from(products)
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .orderBy(products.name);

  // Deduplicate (leftJoin may return multiple rows if multiple images)
  const seen = new Set<string>();
  return rows.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

// ─── Get low stock products ───────────────────────────────────────────────────
export async function getLowStockProducts() {
  return await db
    .select({ id: products.id, name: products.name, sku: products.sku, stock: products.stock })
    .from(products)
    .where(lte(products.stock, LOW_STOCK_THRESHOLD))
    .orderBy(products.stock);
}

// ─── Get stock history for a product ─────────────────────────────────────────
export async function getStockHistory(productId: string) {
  return await db
    .select()
    .from(stockHistory)
    .where(eq(stockHistory.productId, productId))
    .orderBy(desc(stockHistory.changedAt))
    .limit(50);
}

// ─── Get full stock history (all products) ────────────────────────────────────
export async function getAllStockHistory(limit = 100) {
  return await db
    .select({
      id: stockHistory.id,
      productName: products.name,
      previousStock: stockHistory.previousStock,
      newStock: stockHistory.newStock,
      change: stockHistory.change,
      reason: stockHistory.reason,
      referenceId: stockHistory.referenceId,
      changedAt: stockHistory.changedAt,
    })
    .from(stockHistory)
    .leftJoin(products, eq(products.id, stockHistory.productId))
    .orderBy(desc(stockHistory.changedAt))
    .limit(limit);
}

// ─── Bulk update stock ────────────────────────────────────────────────────────
export async function bulkUpdateStock(updates: { productId: string; newStock: number }[]) {
  if (!updates.length) return { success: true };

  try {
    await db.transaction(async (tx) => {
      for (const { productId, newStock } of updates) {
        if (newStock < 0) throw new Error("Stok tidak boleh negatif");

        const [product] = await tx.select({ stock: products.stock })
          .from(products)
          .where(eq(products.id, productId));

        if (!product) continue;

        const change = newStock - product.stock;
        if (change === 0) continue;

        await tx.update(products)
          .set({ stock: newStock, updatedAt: new Date().toISOString() })
          .where(eq(products.id, productId));

        await tx.insert(stockHistory).values({
          productId,
          previousStock: product.stock,
          newStock,
          change,
          reason: "bulk_update",
        });
      }
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

