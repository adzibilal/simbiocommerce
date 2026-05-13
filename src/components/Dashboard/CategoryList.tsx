"use client";

import React, { useState } from "react";
import { deleteCategory } from "@/app/actions/category";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const CategoryList = ({ categories }: { categories: Category[] }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedCategory) {
      await deleteCategory(selectedCategory.id);
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden font-euclid-circular-a">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-3">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-1 duration-150">
                <td className="px-6 py-4 text-custom-sm font-medium text-dark">
                  {category.name}
                </td>
                <td className="px-6 py-4 text-custom-sm text-body">
                  {category.slug}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Link 
                    href={`/admin/edit-category/${category.id}`}
                    className="text-blue hover:text-blue-dark duration-200"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => openDeleteModal(category)}
                    className="text-red hover:text-red-dark duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-lg font-bold text-dark mb-2">Confirm Delete</h2>
            <p className="text-body text-custom-sm mb-4">
              Are you sure you want to delete category <strong>{selectedCategory?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-custom-sm font-medium text-dark bg-gray-2 rounded-lg hover:bg-gray-3 duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 text-custom-sm font-medium text-white bg-red rounded-lg hover:bg-red-dark duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
