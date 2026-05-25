"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { createCategory, updateCategory } from "@/app/actions/category";
import { useRouter } from "next/navigation";
import ImageCropUpload from "./ImageCropUpload";
import ModalPortal from "./ModalPortal";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const CategoryModal = ({ isOpen, onClose, category }: CategoryModalProps) => {
  const router = useRouter();
  const isEditing = !!category;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setImageUrl(category.imageUrl || "");
      setIsSlugManuallyEdited(true);
    } else {
      setName("");
      setSlug("");
      setImageUrl("");
      setIsSlugManuallyEdited(false);
    }
  }, [category, isOpen]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(newName));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugManuallyEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    toast.loading(isEditing ? "Updating category..." : "Creating category...", {
      id: "category-save",
    });

    try {
      const nameTrimmed = name.trim();
      const slugTrimmed = slug.trim();

      if (isEditing && category) {
        await updateCategory(category.id, {
          name: nameTrimmed,
          slug: slugTrimmed,
          imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
        });
        toast.success("Category updated", { id: "category-save" });
      } else {
        await createCategory({
          name: nameTrimmed,
          slug: slugTrimmed,
          imageUrl: imageUrl.trim() || undefined,
        });
        toast.success("Category created", { id: "category-save" });
      }

      router.refresh();
      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message.includes("UNIQUE") ? "Slug already exists" : message, {
        id: "category-save",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 left-0 top-0 z-[200] flex min-h-[100dvh] w-full items-center justify-center p-4">
        <button
          type="button"
          className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
          onClick={onClose}
          aria-label="Close modal"
        />

        <div className="relative z-[1] bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-dark">
              {isEditing ? "Edit Category" : "Add Category"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-dark-4 hover:text-dark transition-colors p-1 rounded-lg hover:bg-gray-1"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="category-modal-name" className="block text-custom-sm font-medium text-dark mb-2">
                Category Name <span className="text-red">*</span>
              </label>
              <input
                id="category-modal-name"
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                placeholder="e.g. Electronics"
              />
            </div>

            <div>
              <label htmlFor="category-modal-slug" className="block text-custom-sm font-medium text-dark mb-2">
                Slug <span className="text-red">*</span>
              </label>
              <input
                id="category-modal-slug"
                type="text"
                required
                value={slug}
                onChange={handleSlugChange}
                className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                placeholder="e.g. electronics"
              />
              <p className="text-custom-xs text-body mt-1">
                Used in URLs. Auto-filled from name until you edit it manually.
              </p>
            </div>

            <div>
              <span className="block text-custom-sm font-medium text-dark mb-2">
                Icon (1:1)
              </span>
              <ImageCropUpload
                onUploadComplete={setImageUrl}
                aspectRatio={1}
                allowAspectChange={false}
                maxFileSize={2}
                buttonText="Upload icon (1:1)"
                uploadingText="Uploading..."
                currentImageUrl={imageUrl}
                onRemove={() => setImageUrl("")}
                previewClassName="w-full max-w-[160px] aspect-square mx-auto mb-3 rounded-lg border border-gray-3 overflow-hidden"
              />
              <p className="text-custom-xs text-body mt-1">
                Square icon recommended (e.g. 512×512). Optional for existing categories.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-dark font-medium rounded-lg border border-gray-3 hover:bg-gray-1 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-white font-medium rounded-lg bg-blue hover:bg-blue-dark transition-colors"
              >
                {isEditing ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default CategoryModal;
