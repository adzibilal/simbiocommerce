"use client";

import React, { useState } from "react";
import { createCategory } from "@/app/actions/category";
import { useRouter } from "next/navigation";

const AddCategoryPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Auto-generate slug if it hasn't been manually edited
    if (!isSlugManuallyEdited) {
      setSlug(
        newName
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^a-z0-9-]/g, "")
      );
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugManuallyEdited(true); // Stop auto-generating once user edits it
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createCategory({ name, slug });
    router.push("/admin/categories");
  };

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Add New Category</h1>
        <p className="text-custom-sm text-body">
          Create a new product category.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Name */}
          <div>
            <label htmlFor="name" className="block text-custom-sm font-medium text-dark mb-2">
              Category Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={name}
              onChange={handleNameChange}
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="e.g. Electronics"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-custom-sm font-medium text-dark mb-2">
              Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={slug}
              onChange={handleSlugChange}
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="e.g. electronics"
            />
            <p className="text-custom-xs text-body mt-1">The slug is used in the URL. It generates automatically as you type the name.</p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark"
            >
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryPage;
