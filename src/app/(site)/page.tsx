import Home from "@/components/Home";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/", {
    title: "Home | SimbioCommerce",
    description: "Shop the best products online at SimbioCommerce.",
  });
}

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
