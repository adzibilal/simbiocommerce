import React from "react";
import Cart from "@/components/Cart";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/cart", {
    title: "Cart | SimbioCommerce",
    description: "Review your shopping cart.",
  });
}

const CartPage = () => {
  return (
    <>
      <Cart />
    </>
  );
};

export default CartPage;
