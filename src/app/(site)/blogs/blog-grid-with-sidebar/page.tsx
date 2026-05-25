import React from "react";
import BlogGridWithSidebar from "@/components/BlogGridWithSidebar";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/blogs", {
    title: "Blog | SimbioCommerce",
    description: "Read our latest articles and news.",
  });
}

const BlogGridWithSidebarPage = () => {
  return (
    <>
      <BlogGridWithSidebar />
    </>
  );
};

export default BlogGridWithSidebarPage;
