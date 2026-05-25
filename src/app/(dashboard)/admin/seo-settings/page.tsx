"use client";


import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  getSeoSettings,
  saveSeoSetting,
  deleteSeoSetting,
} from "@/app/actions/seo-settings";
import ModalPortal from "@/components/Dashboard/ModalPortal";

interface SeoItem {
  id: string;
  pageRoute: string;
  pageTitle: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string | null;
  ogImage: string | null;
  isActive: boolean | null;
}

const SEOSettingsPage = () => {
  const [items, setItems] = useState<SeoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SeoItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SeoItem | null>(null);

  const [formData, setFormData] = useState({
    pageRoute: "/",
    pageTitle: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    ogImage: "",
    isActive: true,
  });

  const fetchData = async () => {
    const data = await getSeoSettings();
    setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      pageRoute: "/",
      pageTitle: "",
      metaTitle: "",
      metaDescription: "",
      keywords: "",
      ogImage: "",
      isActive: true,
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: SeoItem) => {
    setEditingItem(item);
    setFormData({
      pageRoute: item.pageRoute,
      pageTitle: item.pageTitle,
      metaTitle: item.metaTitle,
      metaDescription: item.metaDescription,
      keywords: item.keywords || "",
      ogImage: item.ogImage || "",
      isActive: item.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pageRoute.trim() || !formData.metaTitle.trim()) {
      toast.error("Route and meta title are required");
      return;
    }

    toast.loading("Saving SEO setting...", { id: "seo-toast" });

    try {
      await saveSeoSetting({
        ...formData,
        keywords: formData.keywords || null,
        ogImage: formData.ogImage || null,
      });
      toast.success("SEO setting saved!", { id: "seo-toast" });
      setIsModalOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to save SEO setting", { id: "seo-toast" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    toast.loading("Deleting...", { id: "seo-toast" });
    try {
      await deleteSeoSetting(deleteTarget.id);
      toast.success("SEO setting deleted!", { id: "seo-toast" });
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete", { id: "seo-toast" });
    }
  };

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">SEO Settings</h1>
          <p className="text-custom-sm text-body">
            Manage meta title, description, and keywords per page route.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 font-medium text-white bg-blue py-2.5 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Page SEO
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-dark-4">Loading...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Page</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Meta Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-1 duration-150">
                    <td className="px-6 py-4 text-custom-sm font-medium text-dark">
                      {item.pageTitle}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-custom-xs bg-gray-1 px-2 py-1 rounded">{item.pageRoute}</code>
                    </td>
                    <td className="px-6 py-4 text-custom-sm text-body max-w-xs truncate">
                      {item.metaTitle}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-custom-xs font-semibold rounded-full ${
                        item.isActive ? "bg-green/10 text-green" : "bg-red/10 text-red"
                      }`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-blue hover:text-blue-dark duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="text-red hover:text-red-dark duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-body text-custom-sm">
                      No SEO settings found. Click &quot;Add Page SEO&quot; to create one.
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
            />
            <div className="relative z-[1] bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-dark">
                  {editingItem ? "Edit SEO Setting" : "Add Page SEO"}
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
                  <label className="block text-custom-sm font-medium text-dark mb-1">Page Route *</label>
                  <input
                    type="text"
                    value={formData.pageRoute}
                    onChange={(e) => setFormData({ ...formData, pageRoute: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    placeholder="/"
                    required
                    disabled={!!editingItem}
                  />
                  <p className="text-xs text-dark-4 mt-1">e.g. /, /shop, /blogs, /contact</p>
                </div>

                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">Page Title *</label>
                  <input
                    type="text"
                    value={formData.pageTitle}
                    onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    placeholder="e.g. Home"
                    required
                  />
                </div>

                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">Meta Title *</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    placeholder="e.g. SimbioCommerce - Best Online Shop"
                    required
                  />
                  <p className="text-xs text-dark-4 mt-1">{formData.metaTitle.length}/60 characters</p>
                </div>

                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">Meta Description *</label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    rows={3}
                    placeholder="Describe this page for search engines..."
                    required
                  />
                  <p className="text-xs text-dark-4 mt-1">{formData.metaDescription.length}/160 characters</p>
                </div>

                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">Keywords</label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    placeholder="ecommerce, shop, online store (comma separated)"
                  />
                </div>

                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">OG Image URL</label>
                  <input
                    type="text"
                    value={formData.ogImage}
                    onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    placeholder="/images/og-image.jpg"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-3 text-blue focus:ring-blue"
                  />
                  <span className="text-custom-sm text-dark">Active</span>
                </label>

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
                    {editingItem ? "Update" : "Create"}
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
                Delete SEO setting for <strong>{deleteTarget.pageTitle}</strong> ({deleteTarget.pageRoute})?
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

export default SEOSettingsPage;
