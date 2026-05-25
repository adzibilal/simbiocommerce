import React from "react";
import { Wishlist } from "@/components/Wishlist";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/wishlist", {
    title: "Wishlist | SimbioCommerce",
    description: "Your saved products.",
  });
}

const WishlistPage = () => {
  return (
    <main>
      <Wishlist />
    </main>
  );
};

export default WishlistPage;
