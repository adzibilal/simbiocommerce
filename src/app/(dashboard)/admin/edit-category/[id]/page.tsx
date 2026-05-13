import React from "react";
import { getCategoryById } from "@/app/actions/category";
import EditCategoryForm from "@/components/Dashboard/EditCategoryForm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditCategoryPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Edit Category</h1>
        <p className="text-custom-sm text-body">
          Update product category details.
        </p>
      </div>

      <EditCategoryForm category={category} />
    </div>
  );
};

export default EditCategoryPage;
