import React from "react";
import { getPostCategories } from "@/app/actions/post-category";
import PostCategoryManager from "@/components/Dashboard/PostCategoryManager";

const PostCategoriesPage = async () => {
  const categories = await getPostCategories();

  return (
    <PostCategoryManager initialCategories={categories} />
  );
};

export default PostCategoriesPage;
