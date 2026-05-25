import React from "react";
import BlogGrid from "@/components/BlogGrid";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/blogs", {
    title: "Blog | SimbioCommerce",
    description: "Read our latest articles and news.",
  });
}

const BlogGridPage = () => {
  return (
    <main>
      <BlogGrid />
    </main>
  );
};

export default BlogGridPage;
