"use server";

import { db } from "@/db";
import { products, categories, productImages, reviews } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as crypto from "crypto";

export async function getProducts(page = 1, perPage = 20) {
  const offset = (page - 1) * perPage;
  const [productsData, allImages, allReviews, totalRows] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        stock: products.stock,
        isActive: products.isActive,
        category: categories.name,
        categoryId: products.categoryId,
        sku: products.sku,
        weight: products.weight,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .limit(perPage)
      .offset(offset),
    db.select().from(productImages),
    db.select({
      productId: reviews.productId,
      rating: reviews.rating,
    }).from(reviews).where(eq(reviews.status, "approved")),
    db.select({ count: count() }).from(products),
  ]);

  const data = productsData.map((p) => {
    const imgs = allImages
      .filter((i) => i.productId === p.id)
      .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
    const productReviews = allReviews.filter((r) => r.productId === p.id);
    const reviewCount = productReviews.length;
    const avgRating = reviewCount > 0
      ? Math.round((productReviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
      : null;
    return {
      ...p,
      imageUrl: imgs.find((i) => i.isPrimary)?.imageUrl ?? imgs[0]?.imageUrl ?? undefined,
      images: imgs.map((i) => i.imageUrl),
      avgRating,
      reviewCount,
    };
  });

  return { data, total: totalRows[0].count };
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

export async function getProductBySlug(slug: string) {
  const [productData, allImages] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        stock: products.stock,
        weight: products.weight,
        description: products.description,
        isActive: products.isActive,
        categoryId: products.categoryId,
        sku: products.sku,
        category: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.slug, slug))
      .limit(1),
    db.select().from(productImages),
  ]);

  if (!productData[0]) return null;

  const p = productData[0];
  const imgs = allImages
    .filter((i) => i.productId === p.id)
    .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

  return {
    ...p,
    imageUrl: imgs.find((i) => i.isPrimary)?.imageUrl ?? imgs[0]?.imageUrl ?? undefined,
    images: imgs.map((i) => i.imageUrl),
  };
}
