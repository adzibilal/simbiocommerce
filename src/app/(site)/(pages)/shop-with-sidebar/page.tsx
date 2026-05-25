import React from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { getProducts } from "@/app/actions/product";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/shop-with-sidebar", {
    title: "Shop | SimbioCommerce",
    description: "Browse our full product catalog.",
  });
}

const ShopWithSidebarPage = async () => {
  const products = await getProducts();

  return (
    <main>
      <ShopWithSidebar products={products} />
    </main>
  );
};

export default ShopWithSidebarPage;
