import BlogDetails from "@/components/BlogDetails";
import React from "react";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/blogs", {
    title: "Blog | SimbioCommerce",
    description: "Read our latest articles.",
  });
}

const BlogDetailsPage = () => {
  return (
    <main>
      <BlogDetails />
    </main>
  );
};

export default BlogDetailsPage;
