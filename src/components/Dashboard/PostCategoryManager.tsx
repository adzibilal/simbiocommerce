"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { createPostCategory, updatePostCategory, deletePostCategory } from "@/app/actions/post-category";
import { createPortal } from "react-dom";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const PostCategoryManager = ({ initialCategories }: { initialCategories: Category[] }) => {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const handleOpenModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setSlug(category.slug);
    } else {
      setEditingCategory(null);
      setName("");
      setSlug("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setName("");
    setSlug("");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    toast.loading("Saving category...", { id: "save-toast" });
    try {
      const data = { name, slug };
      const res = editingCategory 
        ? await updatePostCategory(editingCategory.id, data)
        : await createPostCategory(data);

      if (!res.success) {
        toast.error(res.error, { id: "save-toast" });
        return;
      }

      toast.success(editingCategory ? "Category updated!" : "Category created!", { id: "save-toast" });
      handleCloseModal();
      router.refresh();
      
      // Update local state if needed, but refresh should reload props
      // Since we are in a client component, we might need to update state manually or rely on server refresh.
      // Let's rely on router.refresh() for now.
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save category", { id: "save-toast" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    toast.loading("Deleting category...", { id: "delete-toast" });
    try {
      const res = await deletePostCategory(id);
      if (!res.success) {
        toast.error(res.error, { id: "delete-toast" });
        return;
      }
      toast.success("Category deleted!", { id: "delete-toast" });
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete category", { id: "delete-toast" });
    }
  };

  // Sync state with props when props change (after refresh)
  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Blog Categories</h1>
          <p className="text-custom-sm text-body">
            Manage blog post categories.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
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
                    <button 
                      onClick={() => handleOpenModal(category)}
                      className="text-blue hover:text-blue-dark duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="text-red hover:text-red-dark duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-euclid-circular-a">
          <div className="bg-white rounded-2xl shadow-1 border border-gray-2 w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-3">
              <h3 className="text-lg font-bold text-dark">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-custom-sm font-medium text-dark mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  placeholder="e.g. Technology"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="slug" className="block text-custom-sm font-medium text-dark mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  placeholder="auto-generated-slug"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 bg-gray-2 text-dark font-medium rounded-lg hover:bg-gray-3 duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue text-white font-medium rounded-lg hover:bg-blue-dark duration-200"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PostCategoryManager;
