"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { createHeroSlide, updateHeroSlide } from "@/app/actions/hero-slide";
import { useRouter } from "next/navigation";
import ImageCropUpload from "./ImageCropUpload";
import ModalPortal from "./ModalPortal";

interface HeroSlide {
  id: string;
  imageUrl: string;
  link: string;
  linkType: string | null;
  productId: string | null;
  isNewTab: boolean | null;
  order: number;
  isActive: boolean | null;
}

interface ProductOption {
  id: string;
  name: string;
  slug: string;
}

interface HeroSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide?: HeroSlide | null;
  products: ProductOption[];
}

const getProductLink = (product: ProductOption) => `/shop-details?product=${product.slug}`;

const HeroSlideModal = ({ isOpen, onClose, slide, products }: HeroSlideModalProps) => {
  const router = useRouter();
  const isEditing = !!slide;

  const [formData, setFormData] = useState({
    imageUrl: "",
    link: "/products",
    linkType: "custom",
    productId: "",
    isNewTab: false,
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    if (slide) {
      setFormData({
        imageUrl: slide.imageUrl,
        link: slide.link,
        linkType: slide.linkType || "custom",
        productId: slide.productId || "",
        isNewTab: slide.isNewTab ?? false,
        order: slide.order,
        isActive: slide.isActive ?? true,
      });
    } else {
      setFormData({
        imageUrl: "",
        link: "/products",
        linkType: "custom",
        productId: "",
        isNewTab: false,
        order: 0,
        isActive: true,
      });
    }
  }, [slide, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imageUrl.trim()) {
      toast.error("Please upload an image");
      return;
    }

    if (formData.linkType === "product" && !formData.productId) {
      toast.error("Please select a product");
      return;
    }

    if (formData.linkType === "custom" && !formData.link.trim()) {
      toast.error("Link is required");
      return;
    }

    toast.loading(isEditing ? "Updating slide..." : "Creating slide...", {
      id: "slide-toast",
    });

    try {
      const selectedProduct = products.find((product) => product.id === formData.productId);
      const payload = {
        ...formData,
        link: formData.linkType === "product" && selectedProduct
          ? getProductLink(selectedProduct)
          : formData.link,
        productId: formData.linkType === "product" ? formData.productId : null,
      };

      if (isEditing && slide) {
        await updateHeroSlide(slide.id, payload);
        toast.success("Slide updated successfully!", { id: "slide-toast" });
      } else {
        await createHeroSlide(payload);
        toast.success("Slide created successfully!", { id: "slide-toast" });
      }
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        isEditing ? "Failed to update slide" : "Failed to create slide",
        { id: "slide-toast" }
      );
    }
  };

  const handleUploadComplete = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, imageUrl }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
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
              {isEditing ? "Edit Slide" : "Add New Slide"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-dark-4 hover:text-dark transition-colors p-1 rounded-lg hover:bg-gray-1"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Image Upload with Crop */}
            <div>
              <span className="block text-sm font-medium text-dark mb-2">
                Slide Image <span className="text-red">*</span>
              </span>
              <ImageCropUpload
                onUploadComplete={handleUploadComplete}
                aspectRatio={21 / 9}
                allowAspectChange={false}
                maxFileSize={5}
                buttonText="Upload Slide Image (21:9)"
                uploadingText="Uploading..."
                currentImageUrl={formData.imageUrl}
                onRemove={handleRemoveImage}
                previewClassName="w-full aspect-[21/9] mb-3"
              />
              <p className="text-xs text-dark-4 mt-1">
                Recommended: 2560x1080px (21:9) for best display. Max 5MB.
              </p>
            </div>

            {/* Link Type */}
            <div>
              <label htmlFor="hero-link-type" className="block text-sm font-medium text-dark mb-2">
                Link Type <span className="text-red">*</span>
              </label>
              <select
                id="hero-link-type"
                value={formData.linkType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    linkType: e.target.value,
                    productId: e.target.value === "custom" ? "" : formData.productId,
                  })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-3 focus:border-blue focus:ring-1 focus:ring-blue outline-none transition-all text-dark"
                required
              >
                <option value="custom">Custom link</option>
                <option value="product">Product</option>
              </select>
            </div>

            {formData.linkType === "product" ? (
              <div>
                <label htmlFor="hero-product" className="block text-sm font-medium text-dark mb-2">
                  Product <span className="text-red">*</span>
                </label>
                <select
                  id="hero-product"
                  value={formData.productId}
                  onChange={(e) => {
                    const product = products.find((item) => item.id === e.target.value);
                    setFormData({
                      ...formData,
                      productId: e.target.value,
                      link: product ? getProductLink(product) : "",
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-3 focus:border-blue focus:ring-1 focus:ring-blue outline-none transition-all text-dark"
                  required
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-dark-4 mt-1">
                  Slide will link to the selected product page.
                </p>
              </div>
            ) : (
              <div>
                <label htmlFor="hero-link" className="block text-sm font-medium text-dark mb-2">
                  Custom Link <span className="text-red">*</span>
                </label>
                <input
                  id="hero-link"
                  type="text"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="/products or https://example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-3 focus:border-blue focus:ring-1 focus:ring-blue outline-none transition-all text-dark"
                  required
                />
                <p className="text-xs text-dark-4 mt-1">
                  Where users go when they click the slide.
                </p>
              </div>
            )}

            {/* Order */}
            <div>
              <label htmlFor="hero-order" className="block text-sm font-medium text-dark mb-2">
                Display Order
              </label>
              <input
                id="hero-order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: Number.parseInt(e.target.value) || 0 })
                }
                min="0"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-3 focus:border-blue focus:ring-1 focus:ring-blue outline-none transition-all text-dark"
              />
              <p className="text-xs text-dark-4 mt-1">
                Lower numbers appear first
              </p>
            </div>

            {/* Open New Tab */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hero-is-new-tab"
                checked={formData.isNewTab}
                onChange={(e) =>
                  setFormData({ ...formData, isNewTab: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-3 text-blue focus:ring-blue"
              />
              <label htmlFor="hero-is-new-tab" className="text-sm text-dark">
                Open link in new tab
              </label>
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hero-is-active"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-3 text-blue focus:ring-blue"
              />
              <label htmlFor="hero-is-active" className="text-sm text-dark">
                Active (visible on homepage)
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-2">
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
                {isEditing ? "Save Changes" : "Create Slide"}
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </ModalPortal>
  );
};

export default HeroSlideModal;
