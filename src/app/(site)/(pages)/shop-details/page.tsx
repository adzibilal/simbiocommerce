import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/shop-details", {
    title: "Product Details | SimbioCommerce",
    description: "View product details, specifications, and reviews.",
  });
}

const ShopDetailsPage = () => {
  return (
    <main>
      <ShopDetails />
    </main>
  );
};

export default ShopDetailsPage;
