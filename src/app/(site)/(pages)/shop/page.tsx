import React from "react";
import { getProducts } from "@/app/actions/product";
import { getCategories } from "@/app/actions/category";
import ShopGrid from "@/components/Shop/ShopGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse our full product catalog.",
};

const ShopPage = async ({ searchParams }: { searchParams: Promise<{ q?: string }> }) => {
  const { q } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const activeProducts = products.filter((p) => p.isActive);

  return (
    <main>
      <ShopGrid products={activeProducts} categories={categories} initialSearch={q ?? ""} />
    </main>
  );
};

export default ShopPage;
