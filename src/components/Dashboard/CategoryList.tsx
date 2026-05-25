"use client";

import React, { useState } from "react";
import { deleteCategory } from "@/app/actions/category";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CategoryModal from "./CategoryModal";
import ModalPortal from "./ModalPortal";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

const CategoryList = ({ categories }: { categories: Category[] }) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const openAddModal = () => {
    setEditingCategory(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingCategory(null);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedCategory) {
      await deleteCategory(selectedCategory.id);
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Categories</h1>
          <p className="text-custom-sm text-body">Manage your product categories.</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 font-medium text-white bg-blue py-2.5 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Icon</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-custom-sm text-dark-4">
                    No categories yet. Click &quot;Add Category&quot; to create one.
                  </td>
                </tr>
              ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-1 duration-150">
                  <td className="px-6 py-4">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-gray-3 bg-gray-2 shrink-0">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-dark-5 text-lg">
                          📁
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-custom-sm font-medium text-dark">{category.name}</td>
                  <td className="px-6 py-4 text-custom-sm text-body">{category.slug}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(category)}
                      className="text-blue hover:text-blue-dark duration-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteModal(category)}
                      className="text-red hover:text-red-dark duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryModal isOpen={isFormModalOpen} onClose={closeFormModal} category={editingCategory} />

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 left-0 top-0 z-[200] flex min-h-[100dvh] w-full items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative z-[1] bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h2 className="text-lg font-bold text-dark mb-2">Confirm Delete</h2>
            <p className="text-body text-custom-sm mb-4">
              Are you sure you want to delete category <strong>{selectedCategory?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-custom-sm font-medium text-dark bg-gray-2 rounded-lg hover:bg-gray-3 duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-custom-sm font-medium text-white bg-red rounded-lg hover:bg-red-dark duration-200"
              >
                Delete
              </button>
            </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default CategoryList;
