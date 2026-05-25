"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getStoreInfo, saveStoreInfo } from "@/app/actions/store-info";
import ImageCropUpload from "@/components/Dashboard/ImageCropUpload";

interface StoreData {
  storeName: string;
  logoUrl: string;
  faviconUrl: string;
  email: string;
  phone: string;
  supportPhone: string;
  address: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  copyrightText: string;
  primaryColor: string;
}

const StoreProfilePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<StoreData>({
    storeName: "",
    logoUrl: "",
    faviconUrl: "",
    email: "",
    phone: "",
    supportPhone: "",
    address: "",
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    copyrightText: "",
    primaryColor: "#3C50E0",
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getStoreInfo();
      if (data) {
        setFormData({
          storeName: data.storeName || "",
          logoUrl: data.logoUrl || "",
          faviconUrl: data.faviconUrl || "",
          email: data.email || "",
          phone: data.phone || "",
          supportPhone: data.supportPhone || "",
          address: data.address || "",
          facebookUrl: data.facebookUrl || "",
          twitterUrl: data.twitterUrl || "",
          instagramUrl: data.instagramUrl || "",
          linkedinUrl: data.linkedinUrl || "",
          copyrightText: data.copyrightText || "",
          primaryColor: data.primaryColor || "#3C50E0",
        });
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.loading("Saving store profile...", { id: "store-info" });
    try {
      await saveStoreInfo({
        ...formData,
        faviconUrl: formData.faviconUrl || null,
        facebookUrl: formData.facebookUrl || null,
        twitterUrl: formData.twitterUrl || null,
        instagramUrl: formData.instagramUrl || null,
        linkedinUrl: formData.linkedinUrl || null,
        appStoreUrl: null,
        googlePlayUrl: null,
      });
      toast.success("Store profile saved!", { id: "store-info" });
    } catch {
      toast.error("Failed to save store profile", { id: "store-info" });
    }
  };

  const inputClass =
    "w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";
  const labelClass = "block text-custom-sm font-medium text-dark mb-2";

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-1 border border-gray-2 p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-dark-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Store Profile</h1>
        <p className="text-custom-sm text-body">
          Manage store logo, name, contact info, and social media links shown in header & footer.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2 space-y-5">
          <h2 className="text-lg font-semibold text-dark">General</h2>

          <div>
            <label className={labelClass}>Store Name</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className={inputClass}
              placeholder="e.g. SimbioStore"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Logo</label>
              <ImageCropUpload
                onUploadComplete={(url) => setFormData({ ...formData, logoUrl: url })}
                onRemove={() => setFormData({ ...formData, logoUrl: "" })}
                currentImageUrl={formData.logoUrl}
                folder="store"
                buttonText="Upload Logo"
                aspectRatio={3 / 1}
                allowAspectChange
              />
            </div>
            <div>
              <label className={labelClass}>Favicon</label>
              <div className="w-20">
                <ImageCropUpload
                  onUploadComplete={(url) => setFormData({ ...formData, faviconUrl: url })}
                  onRemove={() => setFormData({ ...formData, faviconUrl: "" })}
                  currentImageUrl={formData.faviconUrl}
                  folder="store"
                  buttonText="Upload"
                  aspectRatio={1}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Copyright Text</label>
            <input
              type="text"
              value={formData.copyrightText}
              onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
              className={inputClass}
              placeholder="All rights reserved by SimbioStore."
            />
          </div>

          <div>
            <label className={labelClass}>Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="h-10 w-14 cursor-pointer rounded border border-gray-3 bg-gray-1 p-0.5"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className={inputClass + " flex-1"}
                placeholder="#3C50E0"
                maxLength={7}
              />
              <div
                className="h-10 w-10 flex-shrink-0 rounded-md border border-gray-3"
                style={{ backgroundColor: formData.primaryColor }}
              />
            </div>
            <p className="mt-1.5 text-xs text-dark-4">Applied to buttons, links, and accents across the entire site.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2 space-y-5">
          <h2 className="text-lg font-semibold text-dark">Contact Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                placeholder="support@example.com"
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputClass}
                placeholder="(+099) 532-786-9843"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Support Phone (Header)</label>
              <input
                type="text"
                value={formData.supportPhone}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                className={inputClass}
                placeholder="(+965) 7492-3477"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={inputClass}
              rows={2}
              placeholder="685 Market Street, Las Vegas, LA 95820, United States."
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2 space-y-5">
          <h2 className="text-lg font-semibold text-dark">Social Media Links</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Facebook</label>
              <input
                type="text"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                className={inputClass}
                placeholder="https://facebook.com/yourstore"
              />
            </div>
            <div>
              <label className={labelClass}>Twitter</label>
              <input
                type="text"
                value={formData.twitterUrl}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                className={inputClass}
                placeholder="https://twitter.com/yourstore"
              />
            </div>
            <div>
              <label className={labelClass}>Instagram</label>
              <input
                type="text"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className={inputClass}
                placeholder="https://instagram.com/yourstore"
              />
            </div>
            <div>
              <label className={labelClass}>LinkedIn</label>
              <input
                type="text"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className={inputClass}
                placeholder="https://linkedin.com/company/yourstore"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark"
          >
            Save Store Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreProfilePage;
