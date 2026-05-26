import { db } from "@/db";
import { products, productImages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const [rows, images] = await Promise.all([
    db.select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
    }).from(products).where(eq(products.isActive, true)),
    db.select({
      productId: productImages.productId,
      imageUrl: productImages.imageUrl,
    }).from(productImages).where(eq(productImages.isPrimary, true)),
  ]);

  const imageMap = new Map(images.map((i) => [i.productId, i.imageUrl]));

  const result = rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    imageUrl: imageMap.get(p.id) ?? null,
  }));

  return NextResponse.json(result);
}
