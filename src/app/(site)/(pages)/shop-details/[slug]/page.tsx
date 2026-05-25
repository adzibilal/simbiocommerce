import React from "react";
import ShopDetails from "@/components/ShopDetails";
import type { Metadata } from "next";
import { getProductBySlug } from "@/app/actions/product";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
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

const ShopDetailsPage = async ({ params }: { params: { slug: string } }) => {
  return (
    <main>
      <ShopDetails slug={params.slug} />
    </main>
  );
};

export default ShopDetailsPage;
