"use client";


import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  getHeroFeatures,
  createHeroFeature,
  updateHeroFeature,
  deleteHeroFeature,
} from "@/app/actions/hero-feature";
import ModalPortal from "@/components/Dashboard/ModalPortal";

interface HeroFeature {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean | null;
}

const HeroFeaturesPage = () => {
  const [features, setFeatures] = useState<HeroFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroFeature | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HeroFeature | null>(null);

  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    description: "",
    order: 0,
    isActive: true,
  });

  const fetchData = async () => {
    const data = await getHeroFeatures();
    setFeatures(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({ imageUrl: "", title: "", description: "", order: 0, isActive: true });
  };

  const openAddModal = () => {
    resetForm();
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: HeroFeature) => {
    setEditingItem(item);
    setFormData({
      imageUrl: item.imageUrl,
      title: item.title,
      description: item.description,
      order: item.order,
      isActive: item.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      toast.error("Title and image URL are required");
      return;
    }

    toast.loading("Saving feature...", { id: "feature-toast" });

    try {
      if (editingItem) {
        await updateHeroFeature(editingItem.id, formData);
        toast.success("Feature updated!", { id: "feature-toast" });
      } else {
        await createHeroFeature(formData);
        toast.success("Feature created!", { id: "feature-toast" });
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to save feature", { id: "feature-toast" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    toast.loading("Deleting feature...", { id: "feature-toast" });
    try {
      await deleteHeroFeature(deleteTarget.id);
      toast.success("Feature deleted!", { id: "feature-toast" });
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete feature", { id: "feature-toast" });
    }
  };

  const toggleActive = async (item: HeroFeature) => {
    await updateHeroFeature(item.id, { isActive: !item.isActive });
    fetchData();
  };

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Hero Features</h1>
          <p className="text-custom-sm text-body">
            Manage the feature badges shown below the hero slider (e.g. Free Shipping, Secure Payments).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 font-medium text-white bg-blue py-2.5 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Feature
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-dark-4">Loading features...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Icon</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {features.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-1 duration-150">
                    <td className="px-6 py-4">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-8 h-8 object-contain"
                      />
                    </td>
                    <td className="px-6 py-4 text-custom-sm font-medium text-dark">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 text-custom-sm text-body">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-custom-sm text-body">{item.order}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(item)}
                        className={`inline-flex px-2 py-1 text-custom-xs font-semibold rounded-full cursor-pointer ${
                          item.isActive
                            ? "bg-green/10 text-green"
                            : "bg-red/10 text-red"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </button>
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
                {features.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-body text-custom-sm">
                      No features found. Click &quot;Add Feature&quot; to create one.
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
            <div className="relative z-[1] bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-dark">
                  {editingItem ? "Edit Feature" : "Add New Feature"}
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
                  <label className="block text-custom-sm font-medium text-dark mb-1">Icon URL *</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    placeholder="/images/icons/icon-01.svg or https://..."
                    required
                  />
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="preview"
                      className="w-10 h-10 object-contain mt-2"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    placeholder="e.g. Free Shipping"
                    required
                  />
                </div>

                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    placeholder="e.g. For all orders Rp 200.000"
                  />
                </div>

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
                Are you sure you want to delete feature <strong>{deleteTarget.title}</strong>?
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

export default HeroFeaturesPage;
