import BlogGrid from "@/components/BlogGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | SimbioCommerce",
  description: "Read our latest articles and news.",
};

export default function BlogsPage() {
  return (
    <main>
      <BlogGrid />
    </main>
  );
}
