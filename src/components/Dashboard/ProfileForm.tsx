"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { updateUserProfile } from "@/app/actions/user";
import ImageCropUpload from "./ImageCropUpload";

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  image: string | null;
}

const ProfileForm = ({ user }: { user: User }) => {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.address || "");
  const [postalCode, setPostalCode] = useState(user.postalCode || "");
  const [image, setImage] = useState(user.image || "");

  const handleUploadComplete = (imageUrl: string) => {
    setImage(imageUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.loading("Saving profile...", { id: "save-toast" });

    try {
      const result = await updateUserProfile(user.id, {
        name,
        phone,
        address,
        postalCode,
        image,
      });

      if (result.success) {
        toast.success("Profile updated successfully!", { id: "save-toast" });
        update({ name, image });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update profile", { id: "save-toast" });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to update profile", { id: "save-toast" });
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2 max-w-2xl font-euclid-circular-a">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:space-x-8 mb-6">
          <div className="relative h-32 w-32 rounded-full overflow-hidden border border-gray-3 group">
            {image ? (
              <img src={image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-2 flex items-center justify-center text-dark-5 text-4xl font-bold">
                {name ? name[0].toUpperCase() : "U"}
              </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 duration-200 flex items-center justify-center">
              <span className="text-white text-custom-xs font-medium">Change Photo</span>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 text-center sm:text-left flex-1 max-w-xs">
            <ImageCropUpload
              onUploadComplete={handleUploadComplete}
              aspectRatio={1}
              allowAspectChange={true}
              circularCrop={true}
              maxFileSize={2}
              buttonText="Choose File"
              uploadingText="Uploading..."
            />
            <p className="text-custom-xs text-body mt-2">
              JPG, PNG or GIF. Max 2MB. Crop to 1:1 for best results.
            </p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-custom-sm font-medium text-dark mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        {/* Email (Read Only) */}
        <div>
          <label htmlFor="email" className="block text-custom-sm font-medium text-dark mb-2">
            Email Address (Cannot be changed)
          </label>
          <input
            type="email"
            id="email"
            value={user.email}
            readOnly
            className="w-full bg-gray-2 rounded-md border border-gray-3 py-3 px-5 text-body outline-none cursor-not-allowed"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-custom-sm font-medium text-dark mb-2">
            Phone Number
          </label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            placeholder="e.g. 08123456789"
          />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-custom-sm font-medium text-dark mb-2">
            Address
          </label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            rows={4}
            placeholder="e.g. Jl. Raya No. 123"
          ></textarea>
        </div>

        {/* Postal Code */}
        <div>
          <label htmlFor="postalCode" className="block text-custom-sm font-medium text-dark mb-2">
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            placeholder="e.g. 12345"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
