import React from "react";
import ProductForm from "@/components/Dashboard/ProductForm";
import { getCategories } from "@/app/actions/category";
import { getProductById } from "@/app/actions/product";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const EditProductPage = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const categories = await getCategories();
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  // Convert categories to the format expected by ProductForm if needed
  // But they are already { id, name, slug } so it should match!

  return <ProductForm categories={categories} initialData={product} />;
};

export default EditProductPage;
