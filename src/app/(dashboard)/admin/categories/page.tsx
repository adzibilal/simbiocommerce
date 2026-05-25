import type { Metadata } from "next";
export const metadata: Metadata = { title: "Categories" };

import { getCategories } from "@/app/actions/category";
import CategoryList from "@/components/Dashboard/CategoryList";

const CategoriesPage = async () => {
  const categories = await getCategories();

  return <CategoryList categories={categories} />;
};

export default CategoriesPage;
