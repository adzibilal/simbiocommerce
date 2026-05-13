import React from "react";
import { getPostCategories } from "@/app/actions/post-category";
import PostForm from "@/components/Dashboard/PostForm";

const AddPostPage = async () => {
  const categories = await getPostCategories();

  return (
    <PostForm categories={categories} />
  );
};

export default AddPostPage;
