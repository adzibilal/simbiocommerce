import React from "react";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";
import { getProducts } from "@/app/actions/product";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/shop-without-sidebar", {
    title: "Shop | SimbioCommerce",
    description: "Browse our full product catalog.",
  });
}

const ShopWithoutSidebarPage = async () => {
  const products = await getProducts();

  return (
    <main>
      <ShopWithoutSidebar products={products} />
    </main>
  );
};

export default ShopWithoutSidebarPage;
