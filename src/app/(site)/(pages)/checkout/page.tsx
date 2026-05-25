import React from "react";
import Checkout from "@/components/Checkout";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/checkout", {
    title: "Checkout | SimbioCommerce",
    description: "Complete your purchase securely.",
  });
}

const CheckoutPage = () => {
  return (
    <main>
      <Checkout />
    </main>
  );
};

export default CheckoutPage;
