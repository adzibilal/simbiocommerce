"use client";


import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  getPromoBanners,
  createPromoBanner,
  updatePromoBanner,
  deletePromoBanner,
} from "@/app/actions/promo-banner";
import { getProducts } from "@/app/actions/product";
import ModalPortal from "@/components/Dashboard/ModalPortal";
import ImageCropUpload from "@/components/Dashboard/ImageCropUpload";

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  description: string | null;
  buttonText: string;
  buttonLink: string;
  imageUrl: string | null;
  bgColor: string;
  buttonColor: string;
  layout: string;
  linkType: string;
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

const LAYOUT_OPTIONS = [
  { value: "big", label: "Big Banner (Full Width)" },
  { value: "small_left", label: "Small Banner (Image Left)" },
  { value: "small_right", label: "Small Banner (Image Right)" },
];

const COLOR_OPTIONS = [
  { value: "blue", label: "Blue" },
  { value: "teal", label: "Teal" },
  { value: "orange", label: "Orange" },
];

const PromoBannerPage = () => {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromoBanner | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "Buy Now",
    buttonLink: "#",
    imageUrl: "",
    bgColor: "#F5F5F7",
    buttonColor: "blue",
    layout: "big",
    linkType: "custom",
    productId: "",
    isNewTab: false,
    order: 0,
    isActive: true,
  });

  const fetchData = async () => {
    const [bannerData, productData] = await Promise.all([
      getPromoBanners(),
      getProducts(),
    ]);
    setBanners(bannerData);
    setProducts(
      productData.map((p: any) => ({ id: p.id, name: p.name, slug: p.slug }))
    );
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      buttonText: "Buy Now",
      buttonLink: "#",
      imageUrl: "",
      bgColor: "#F5F5F7",
      buttonColor: "blue",
      layout: "big",
      linkType: "custom",
      productId: "",
      isNewTab: false,
      order: 0,
      isActive: true,
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: PromoBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description || "",
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      imageUrl: banner.imageUrl || "",
      bgColor: banner.bgColor,
      buttonColor: banner.buttonColor,
      layout: banner.layout,
      linkType: banner.linkType || "custom",
      productId: banner.productId || "",
      isNewTab: banner.isNewTab ?? false,
      order: banner.order,
      isActive: banner.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subtitle.trim()) {
      toast.error("Title and subtitle are required");
      return;
    }

    toast.loading("Saving banner...", { id: "banner-toast" });

    try {
      const payload = {
        ...formData,
        description: formData.description || null,
        imageUrl: formData.imageUrl || null,
        productId: formData.linkType === "product" ? formData.productId : null,
      };

      if (editingBanner) {
        await updatePromoBanner(editingBanner.id, payload);
        toast.success("Banner updated!", { id: "banner-toast" });
      } else {
        await createPromoBanner(payload);
        toast.success("Banner created!", { id: "banner-toast" });
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to save banner", { id: "banner-toast" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    toast.loading("Deleting banner...", { id: "banner-toast" });
    try {
      await deletePromoBanner(deleteTarget.id);
      toast.success("Banner deleted!", { id: "banner-toast" });
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete banner", { id: "banner-toast" });
    }
  };

  const toggleActive = async (banner: PromoBanner) => {
    await updatePromoBanner(banner.id, { isActive: !banner.isActive });
    fetchData();
  };

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Promo Banners</h1>
          <p className="text-custom-sm text-body">
            Manage promotional banners on the homepage.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 font-medium text-white bg-blue py-2.5 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Banner
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-dark-4">Loading banners...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Layout</th>
                  <th className="px-6 py-4">Button</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-1 duration-150">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-custom-sm font-medium text-dark">{banner.title}</p>
                        <p className="text-custom-xs text-body">{banner.subtitle}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-custom-xs font-semibold rounded-full bg-blue/10 text-blue capitalize">
                        {banner.layout.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-custom-sm text-body">{banner.buttonText}</td>
                    <td className="px-6 py-4 text-custom-sm text-body">{banner.order}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(banner)}
                        className={`inline-flex px-2 py-1 text-custom-xs font-semibold rounded-full cursor-pointer ${
                          banner.isActive
                            ? "bg-green/10 text-green"
                            : "bg-red/10 text-red"
                        }`}
                      >
                        {banner.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(banner)}
                        className="text-blue hover:text-blue-dark duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(banner)}
                        className="text-red hover:text-red-dark duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {banners.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-body text-custom-sm">
                      No promo banners found. Click &quot;Add Banner&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 left-0 top-0 z-[200] flex min-h-[100dvh] w-full items-center justify-center p-4 font-euclid-circular-a">
            <button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
            />
            <div className="relative z-[1] bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-dark">
                  {editingBanner ? "Edit Banner" : "Add New Banner"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-body hover:text-dark p-1 rounded-lg hover:bg-gray-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">Layout</label>
                  <select
                    value={formData.layout}
                    onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                  >
                    {LAYOUT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    placeholder="e.g. Apple iPhone 14 Plus"
                    required
                  />
                </div>

                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">Subtitle *</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    placeholder="e.g. UP TO 30% OFF"
                    required
                  />
                </div>

                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    rows={3}
                    placeholder="Banner description text..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-custom-sm font-medium text-dark mb-1">Button Text</label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                      placeholder="e.g. Buy Now"
                    />
                  </div>
                  <div>
                    <label className="block text-custom-sm font-medium text-dark mb-1">Button Link</label>
                    <input
                      type="text"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                      placeholder="e.g. /shop"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">Image</label>
                  <ImageCropUpload
                    currentImageUrl={formData.imageUrl || undefined}
                    onUploadComplete={(url) => setFormData((f) => ({ ...f, imageUrl: url }))}
                    onRemove={() => setFormData((f) => ({ ...f, imageUrl: "" }))}
                    folder="promo-banners"
                    aspectRatio={16 / 9}
                    allowAspectChange
                    buttonText="Upload Image"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-custom-sm font-medium text-dark mb-1">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.bgColor}
                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                        className="w-10 h-10 rounded border border-gray-3 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.bgColor}
                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-custom-sm font-medium text-dark mb-1">Button Color</label>
                    <select
                      value={formData.buttonColor}
                      onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    >
                      {COLOR_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">Link Type</label>
                  <select
                    value={formData.linkType}
                    onChange={(e) => setFormData({ ...formData, linkType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                  >
                    <option value="custom">Custom Link</option>
                    <option value="product">Product</option>
                  </select>
                </div>

                {formData.linkType === "product" && (
                  <div>
                    <label className="block text-custom-sm font-medium text-dark mb-1">Product</label>
                    <select
                      value={formData.productId}
                      onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-custom-sm font-medium text-dark mb-1">Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNewTab}
                      onChange={(e) => setFormData({ ...formData, isNewTab: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-3 text-blue focus:ring-blue"
                    />
                    <span className="text-custom-sm text-dark">Open in new tab</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-3 text-blue focus:ring-blue"
                    />
                    <span className="text-custom-sm text-dark">Active</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-gray-2 text-dark font-medium rounded-lg hover:bg-gray-3 duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue text-white font-medium rounded-lg hover:bg-blue-dark duration-200"
                  >
                    {editingBanner ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {deleteTarget && (
        <ModalPortal>
          <div className="fixed inset-0 left-0 top-0 z-[200] flex min-h-[100dvh] w-full items-center justify-center p-4 font-euclid-circular-a">
            <button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
              onClick={() => setDeleteTarget(null)}
            />
            <div className="relative z-[1] bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl">
              <h2 className="text-lg font-bold text-dark mb-2">Confirm Delete</h2>
              <p className="text-body text-custom-sm mb-4">
                Are you sure you want to delete banner <strong>{deleteTarget.title}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
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

export default PromoBannerPage;
