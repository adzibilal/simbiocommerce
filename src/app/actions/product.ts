"use server";

import { db } from "@/db";
import { products, categories, productImages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as crypto from "crypto";

export async function getProducts() {
  return await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      stock: products.stock,
      isActive: products.isActive,
      category: categories.name,
      sku: products.sku,
      weight: products.weight,
      imageUrl: productImages.imageUrl,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(productImages, and(eq(products.id, productImages.productId), eq(productImages.isPrimary, true)));
}

export async function createProduct(
  data: { 
    name: string; 
    slug: string; 
    price: number; 
    stock?: number; 
    isActive?: boolean; 
    categoryId?: string;
    sku?: string;
    weight: number;
    description?: string;
  }, 
  images?: { imageUrl: string; isPrimary: boolean }[]
) {
  try {
    const id = crypto.randomUUID();
    await db.insert(products).values({ id, ...data });
    
    if (images && images.length > 0) {
      await db.insert(productImages).values(
        images.map(img => ({ ...img, productId: id }))
      );
    }
    
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, error: "Product slug or SKU already exists!" };
    }
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function updateProduct(
  id: string, 
  data: { 
    name?: string; 
    slug?: string; 
    price?: number; 
    stock?: number; 
    isActive?: boolean; 
    categoryId?: string;
    sku?: string;
    weight?: number;
    description?: string;
  },
  images?: { imageUrl: string; isPrimary: boolean }[]
) {
  try {
    await db.update(products).set(data).where(eq(products.id, id));
    
    if (images) {
      // Replace images for simplicity
      await db.delete(productImages).where(eq(productImages.productId, id));
      if (images.length > 0) {
        await db.insert(productImages).values(
          images.map(img => ({ ...img, productId: id }))
        );
      }
    }
    
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    // Delete images first (foreign key constraint might prevent deleting product first)
    await db.delete(productImages).where(eq(productImages.productId, id));
    await db.delete(products).where(eq(products.id, id));
    
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete product" };
  }
}

export async function getProductById(id: string) {
  const result = await db.select().from(products).where(eq(products.id, id));
  if (!result[0]) return null;
  
  const images = await db.select().from(productImages).where(eq(productImages.productId, id));
  
  return {
    ...result[0],
    images: images.map(img => ({ imageUrl: img.imageUrl, isPrimary: img.isPrimary || false }))
  };
}
