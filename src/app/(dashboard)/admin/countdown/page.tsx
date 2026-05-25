"use client";


import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  getCountdownSettings,
  createCountdown,
  updateCountdown,
  deleteCountdown,
} from "@/app/actions/countdown";
import { getProducts } from "@/app/actions/product";
import ModalPortal from "@/components/Dashboard/ModalPortal";

interface CountdownItem {
  id: string;
  label: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  buttonText: string;
  buttonLink: string;
  endDate: string;
  bgColor: string;
  buttonColor: string;
  linkType: string;
  productId: string | null;
  isNewTab: boolean | null;
  isActive: boolean | null;
}

interface ProductOption {
  id: string;
  name: string;
  slug: string;
}

const COLOR_OPTIONS = [
  { value: "blue", label: "Blue" },
  { value: "teal", label: "Teal" },
  { value: "orange", label: "Orange" },
];

const CountdownPage = () => {
  const [countdowns, setCountdowns] = useState<CountdownItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CountdownItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CountdownItem | null>(null);

  const [formData, setFormData] = useState({
    label: "Don't Miss!!",
    title: "",
    description: "",
    imageUrl: "",
    buttonText: "Check it Out!",
    buttonLink: "#",
    endDate: "",
    bgColor: "#D0E9F3",
    buttonColor: "blue",
    linkType: "custom",
    productId: "",
    isNewTab: false,
    isActive: true,
  });

  const fetchData = async () => {
    const [countdownData, productData] = await Promise.all([
      getCountdownSettings(),
      getProducts(),
    ]);
    setCountdowns(countdownData);
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
      label: "Don't Miss!!",
      title: "",
      description: "",
      imageUrl: "",
      buttonText: "Check it Out!",
      buttonLink: "#",
      endDate: "",
      bgColor: "#D0E9F3",
      buttonColor: "blue",
      linkType: "custom",
      productId: "",
      isNewTab: false,
      isActive: true,
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: CountdownItem) => {
    setEditingItem(item);
    setFormData({
      label: item.label,
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      buttonText: item.buttonText,
      buttonLink: item.buttonLink,
      endDate: item.endDate,
      bgColor: item.bgColor,
      buttonColor: item.buttonColor,
      linkType: item.linkType || "custom",
      productId: item.productId || "",
      isNewTab: item.isNewTab ?? false,
      isActive: item.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.endDate) {
      toast.error("Title and end date are required");
      return;
    }

    toast.loading("Saving countdown...", { id: "countdown-toast" });

    try {
      const payload = {
        ...formData,
        description: formData.description || null,
        imageUrl: formData.imageUrl || null,
        productId: formData.linkType === "product" ? formData.productId : null,
      };

      if (editingItem) {
        await updateCountdown(editingItem.id, payload);
        toast.success("Countdown updated!", { id: "countdown-toast" });
      } else {
        await createCountdown(payload);
        toast.success("Countdown created!", { id: "countdown-toast" });
      }

      setIsModalOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to save countdown", { id: "countdown-toast" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    toast.loading("Deleting countdown...", { id: "countdown-toast" });
    try {
      await deleteCountdown(deleteTarget.id);
      toast.success("Countdown deleted!", { id: "countdown-toast" });
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete countdown", { id: "countdown-toast" });
    }
  };

  const toggleActive = async (item: CountdownItem) => {
    await updateCountdown(item.id, { isActive: !item.isActive });
    fetchData();
  };

  const formatEndDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Countdown Settings</h1>
          <p className="text-custom-sm text-body">
            Manage flash sale countdown timers on the homepage.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 font-medium text-white bg-blue py-2.5 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Countdown
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-dark-4">Loading countdowns...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">End Date</th>
                  <th className="px-6 py-4">Button</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {countdowns.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-1 duration-150">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-custom-sm font-medium text-dark">{item.title}</p>
                        <p className="text-custom-xs text-body">{item.label}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-custom-sm text-body">
                      {formatEndDate(item.endDate)}
                    </td>
                    <td className="px-6 py-4 text-custom-sm text-body">{item.buttonText}</td>
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
                {countdowns.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-body text-custom-sm">
                      No countdown timers found. Click &quot;Add Countdown&quot; to create one.
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
                  {editingItem ? "Edit Countdown" : "Add New Countdown"}
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
                  <label className="block text-custom-sm font-medium text-dark mb-1">Label</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    placeholder="e.g. Don't Miss!!"
                  />
                </div>

                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    placeholder="e.g. Enhance Your Music Experience"
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
                    placeholder="e.g. The Havit H206d is a wired PC headphone."
                  />
                </div>

                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-custom-sm font-medium text-dark mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                    placeholder="/images/countdown/countdown-01.png"
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
                      placeholder="e.g. Check it Out!"
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
                Are you sure you want to delete countdown <strong>{deleteTarget.title}</strong>?
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

export default CountdownPage;
