import React from "react";
import ProductForm from "@/components/Dashboard/ProductForm";
import { getCategories } from "@/app/actions/category";

const AddProductPage = async () => {
  const categories = await getCategories();

  return <ProductForm categories={categories} />;
};

export default AddProductPage;
