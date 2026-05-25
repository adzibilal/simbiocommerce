import React from "react";
import BlogDetailsWithSidebar from "@/components/BlogDetailsWithSidebar";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/blogs", {
    title: "Blog | SimbioCommerce",
    description: "Read our latest articles.",
  });
}

const BlogDetailsWithSidebarPage = () => {
  return (
    <main>
      <BlogDetailsWithSidebar />
    </main>
  );
};

export default BlogDetailsWithSidebarPage;
