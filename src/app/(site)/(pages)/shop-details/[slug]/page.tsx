import React from "react";
import ShopDetails from "@/components/ShopDetails";
import type { Metadata } from "next";
import { getProductBySlug, getProducts } from "@/app/actions/product";
import { getProductReviews } from "@/app/actions/review";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product | SimbioCommerce" };
  return {
    title: `${product.name} | SimbioCommerce`,
    description: product.description?.slice(0, 160) || `Buy ${product.name} at SimbioCommerce.`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160) || "",
      ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
    },
  };
}

const ShopDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, allProducts] = await Promise.all([
    getProductReviews(product.id),
    getProducts(),
  ]);

  const relatedProducts = allProducts.filter((p) => p.id !== product.id && p.isActive !== false);

  return (
    <main>
      <ShopDetails product={product} reviews={reviews} relatedProducts={relatedProducts} />
    </main>
  );
};

export default ShopDetailsPage;
