import React from "react";
import { getPostById } from "@/app/actions/post";
import { getPostCategories } from "@/app/actions/post-category";
import PostForm from "@/components/Dashboard/PostForm";
import { notFound } from "next/navigation";

interface EditPostPageProps {
  params: {
    id: string;
  };
}

const EditPostPage = async ({ params }: EditPostPageProps) => {
  const [post, categories] = await Promise.all([
    getPostById(params.id),
    getPostCategories(),
  ]);

  if (!post) {
    notFound();
  }

  // Cast nulls to undefined or handle them to match PostForm props
  const formattedPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content || undefined,
    featuredImage: post.featuredImage || undefined,
    categoryId: post.categoryId || undefined,
    status: post.status || undefined,
    metaTitle: post.metaTitle || undefined,
    metaDescription: post.metaDescription || undefined,
  };

  return (
    <PostForm categories={categories} initialData={formattedPost} />
  );
};

export default EditPostPage;
