"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { upload } from "@imagekit/next";
import { toast } from "react-hot-toast";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { updateUserProfile } from "@/app/actions/user";
import 'react-image-crop/dist/ReactCrop.css';

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
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Crop States
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(1); // Default 1:1
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setTempImageSrc(reader.result as string);
        setIsCropModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect || 1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
  };

  const handleCropAndUpload = async () => {
    if (!completedCrop || !imgRef.current) return;

    setUploading(true);
    setIsCropModalOpen(false); // Close modal
    toast.loading("Uploading image...", { id: "upload-toast" });

    try {
      // Get cropped image as blob
      const blob = await getCroppedImg(imgRef.current, completedCrop);
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      // Get auth params
      const response = await fetch("/api/upload-auth");
      if (!response.ok) throw new Error("Failed to get auth params");

      const data = await response.json();
      const { signature, expire, token, publicKey, folder } = data;

      // Upload
      const uploadResponse = await upload({
        file,
        fileName: file.name,
        publicKey,
        signature,
        expire,
        token,
        folder: folder,
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
      });

      console.log("Upload response:", uploadResponse);
      setImage(uploadResponse.url); // Save the secure URL from ImageKit
      toast.success("Image uploaded successfully!", { id: "upload-toast" });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed!", { id: "upload-toast" });
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
        {/* Avatar Upload (Floating Button) */}
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

          <div className="mt-4 sm:mt-0 text-center sm:text-left">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              className="hidden"
              accept="image/*"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-medium text-blue border border-blue py-2.5 px-5 rounded-lg hover:bg-blue/5 duration-200 disabled:opacity-50"
              disabled={uploading}
            >
              {uploading ? `Uploading... ${Math.round(progress)}%` : "Choose File"}
            </button>
            <p className="text-custom-xs text-body mt-2">
              JPG, PNG or GIF. Max 2MB.
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

      {/* Cropping Modal */}
      {isCropModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col space-y-4 shadow-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-dark">Crop Your Photo</h3>
              <button
                onClick={() => setIsCropModalOpen(false)}
                className="text-body hover:text-dark"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Aspect Ratio Buttons */}
            <div className="flex space-x-2 text-custom-sm">
              <button
                onClick={() => { setAspect(1); setCrop(undefined); }}
                className={`px-3 py-1.5 rounded-lg border ${aspect === 1 ? 'bg-blue text-white border-blue' : 'bg-gray-1 text-dark-4 border-gray-3'}`}
              >
                1:1
              </button>
              <button
                onClick={() => { setAspect(16 / 9); setCrop(undefined); }}
                className={`px-3 py-1.5 rounded-lg border ${aspect === 16 / 9 ? 'bg-blue text-white border-blue' : 'bg-gray-1 text-dark-4 border-gray-3'}`}
              >
                16:9
              </button>
              <button
                onClick={() => { setAspect(undefined); setCrop(undefined); }}
                className={`px-3 py-1.5 rounded-lg border ${aspect === undefined ? 'bg-blue text-white border-blue' : 'bg-gray-1 text-dark-4 border-gray-3'}`}
              >
                Custom
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-gray-1 rounded-lg p-4 flex items-center justify-center">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                circularCrop={aspect === 1}
              >
                <img
                  ref={imgRef}
                  src={tempImageSrc}
                  alt="Crop me"
                  onLoad={onImageLoad}
                  className="w-auto h-full"
                />
              </ReactCrop>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCropModalOpen(false)}
                className="px-5 py-2.5 bg-gray-2 text-dark font-medium rounded-lg hover:bg-gray-3 duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCropAndUpload}
                className="px-5 py-2.5 bg-blue text-white font-medium rounded-lg hover:bg-blue-dark duration-200"
              >
                Crop & Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get cropped image
function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('Failed to get canvas context'));
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg');
  });
}

export default ProfileForm;
