"use client";

import React, { useState, useRef, useCallback } from "react";
import { upload } from "@imagekit/next";
import { toast } from "react-hot-toast";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import ModalPortal from "./ModalPortal";

function isPngSource(file: File, dataUrl?: string): boolean {
  if (file.type === "image/png") return true;
  if (file.name.toLowerCase().endsWith(".png")) return true;
  if (dataUrl?.startsWith("data:image/png")) return true;
  return false;
}

function imageHasTransparency(image: HTMLImageElement): boolean {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (width === 0 || height === 0) return false;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;

  ctx.drawImage(image, 0, 0);
  const { data } = ctx.getImageData(0, 0, width, height);

  for (let i = 3; i < data.length; i += 16) {
    if (data[i] < 255) return true;
  }

  return false;
}

interface ImageCropUploadProps {
  onUploadComplete: (imageUrl: string) => void;
  aspectRatio?: number; // e.g., 16/9, 1, 4/3, etc.
  allowAspectChange?: boolean;
  circularCrop?: boolean;
  maxFileSize?: number; // in MB
  folder?: string;
  buttonText?: string;
  uploadingText?: string;
  className?: string;
  previewClassName?: string;
  currentImageUrl?: string;
  onRemove?: () => void;
  preserveTransparency?: boolean;
}

// Helper function to get cropped image
// Fixes stretching by properly scaling crop coordinates to natural image dimensions
function getCroppedImg(image: HTMLImageElement, crop: PixelCrop, isPng = false): Promise<Blob> {
  const canvas = document.createElement("canvas");

  // Calculate scale between displayed image and natural (original) image
  const imageRect = image.getBoundingClientRect();
  const scaleX = image.naturalWidth / imageRect.width;
  const scaleY = image.naturalHeight / imageRect.height;

  // The actual crop dimensions in the original image
  const cropWidth = Math.floor(crop.width * scaleX);
  const cropHeight = Math.floor(crop.height * scaleY);

  // Set canvas size to the actual crop dimensions (not the displayed crop size)
  canvas.width = cropWidth;
  canvas.height = cropHeight;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    return Promise.reject(new Error("Failed to get canvas context"));
  }

  // Enable high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (isPng) {
    ctx.clearRect(0, 0, cropWidth, cropHeight);
  } else {
    // For non-PNG formats fill white background to avoid black where transparency was
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cropWidth, cropHeight);
  }

  // Draw the cropped portion from the original image
  ctx.drawImage(
    image,
    // Source coordinates (in original image scale)
    Math.floor(crop.x * scaleX),
    Math.floor(crop.y * scaleY),
    cropWidth,
    cropHeight,
    // Destination coordinates (fill the entire canvas)
    0,
    0,
    cropWidth,
    cropHeight
  );

  const mimeType = isPng ? "image/png" : "image/jpeg";
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, mimeType, isPng ? undefined : 0.95);
  });
}

const ImageCropUpload: React.FC<ImageCropUploadProps> = ({
  onUploadComplete,
  aspectRatio = 21 / 9,
  allowAspectChange = false,
  circularCrop = false,
  maxFileSize = 10,
  folder,
  buttonText = "Upload Image",
  uploadingText = "Uploading...",
  className = "",
  previewClassName = "",
  currentImageUrl,
  onRemove,
  preserveTransparency = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const isPngRef = useRef(false);
  const hasAlphaRef = useRef(false);

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(aspectRatio);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];

        // Check file size
        if (file.size > maxFileSize * 1024 * 1024) {
          toast.error(`File size must be less than ${maxFileSize}MB`);
          return;
        }

        const reader = new FileReader();
        reader.addEventListener("load", () => {
          const dataUrl = reader.result as string;
          const png = isPngSource(file, dataUrl);
          isPngRef.current = png;
          setTempImageSrc(dataUrl);
          setIsCropModalOpen(true);
        });
        reader.readAsDataURL(file);
      }
    },
    [maxFileSize]
  );

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const image = e.currentTarget;
      hasAlphaRef.current = imageHasTransparency(image);

      const { width, height } = image;
      const initialCrop = centerCrop(
        makeAspectCrop(
          {
            unit: "%",
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
    },
    [aspect]
  );

  const handleCropAndUpload = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;

    const imageElement = imgRef.current;
    const shouldPreservePng =
      preserveTransparency ||
      isPngRef.current ||
      hasAlphaRef.current ||
      tempImageSrc.startsWith("data:image/png");

    setUploading(true);
    toast.loading("Uploading image...", { id: "upload-toast" });

    try {
      const blob = await getCroppedImg(imageElement, completedCrop, shouldPreservePng);
      setIsCropModalOpen(false);

      const ext = shouldPreservePng ? "png" : "jpg";
      const mimeType = shouldPreservePng ? "image/png" : "image/jpeg";
      const file = new File([blob], `cropped-image.${ext}`, { type: mimeType });

      // Get auth params
      const response = await fetch("/api/upload-auth");
      if (!response.ok) throw new Error("Failed to get auth params");

      const data = await response.json();
      const { signature, expire, token, publicKey, folder: defaultFolder } = data;

      // Upload
      const uploadResponse = await upload({
        file,
        fileName: file.name,
        publicKey,
        signature,
        expire,
        token,
        folder: folder || defaultFolder,
        onProgress: (event) => {
          setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });

      onUploadComplete(uploadResponse.url);
      toast.success("Image uploaded successfully!", { id: "upload-toast" });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed!", { id: "upload-toast" });
    } finally {
      setUploading(false);
      setProgress(0);
      setTempImageSrc("");
      setCrop(undefined);
      setCompletedCrop(undefined);
      isPngRef.current = false;
      hasAlphaRef.current = false;
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [completedCrop, folder, onUploadComplete, preserveTransparency, tempImageSrc]);

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove();
    }
  }, [onRemove]);

  // Calculate aspect ratio buttons
  const aspectOptions = [
    { label: "1:1", value: 1 },
    { label: "21:9", value: 21 / 9 },
    { label: "16:9", value: 16 / 9 },
    { label: "4:3", value: 4 / 3 },
    { label: "3:2", value: 3 / 2 },
    { label: "Custom", value: undefined },
  ];

  return (
    <div className={className}>
      {/* Preview of current image */}
      {currentImageUrl && (
        <div
          className={`relative rounded-lg overflow-hidden border border-gray-3 ${previewClassName}`}
          style={{
            backgroundImage:
              "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
            backgroundColor: "#f9fafb",
          }}
        >
          <img
            src={currentImageUrl}
            alt="Uploaded"
            className="w-full h-full object-contain"
          />
          {onRemove && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red text-white p-1.5 rounded-full hover:bg-red-dark duration-200"
              title="Remove image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Upload Button / Dropzone - Hidden when image exists */}
      {!currentImageUrl && (
        <>
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
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-3 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-1 hover:bg-gray-2 duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-10 h-10 text-gray-4 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <p className="text-custom-sm text-body">
              {uploading ? `${uploadingText} ${progress}%` : buttonText}
            </p>
            <p className="text-custom-xs text-body mt-1">
              PNG, JPG up to {maxFileSize}MB
              {Boolean(aspectRatio) && (() => {
                let ratioText = "Fixed";
                if (aspectRatio === 1) ratioText = "1:1";
                else if (aspectRatio === 21 / 9) ratioText = "21:9";
                else if (aspectRatio === 16 / 9) ratioText = "16:9";
                else if (aspectRatio === 4 / 3) ratioText = "4:3";
                else if (aspectRatio === 3 / 2) ratioText = "3:2";
                return ` • ${ratioText} aspect ratio`;
              })()}
            </p>
          </button>
        </>
      )}

      {/* Cropping Modal */}
      {isCropModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 left-0 top-0 z-[200] flex min-h-[100dvh] w-full items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative z-[1] bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col space-y-4 shadow-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-dark">Crop Image</h3>
              <button
                type="button"
                onClick={() => {
                  setIsCropModalOpen(false);
                  setTempImageSrc("");
                  isPngRef.current = false;
                  hasAlphaRef.current = false;
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-body hover:text-dark"
                aria-label="Close crop modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Aspect Ratio Buttons */}
            {allowAspectChange && (
              <div className="flex flex-wrap gap-2 text-custom-sm">
                {aspectOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => {
                      setAspect(option.value);
                      setCrop(undefined);
                    }}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${
                      aspect === option.value
                        ? "bg-blue text-white border-blue"
                        : "bg-gray-1 text-dark-4 border-gray-3 hover:bg-gray-2"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* Crop Preview */}
            <div className="flex-1 overflow-auto bg-gray-1 rounded-lg p-4 flex items-center justify-center min-h-[300px] max-h-[70vh]">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                circularCrop={circularCrop && aspect === 1}
                className="max-w-full"
              >
                <img
                  ref={imgRef}
                  src={tempImageSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="block max-w-full max-h-[65vh] object-contain"
                  style={{ maxWidth: "100%", height: "auto", aspectRatio: "auto" }}
                />
              </ReactCrop>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsCropModalOpen(false);
                  setTempImageSrc("");
                  isPngRef.current = false;
                  hasAlphaRef.current = false;
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="px-5 py-2.5 bg-gray-2 text-dark font-medium rounded-lg hover:bg-gray-3 duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropAndUpload}
                disabled={!completedCrop}
                className="px-5 py-2.5 bg-blue text-white font-medium rounded-lg hover:bg-blue-dark duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crop & Upload
              </button>
            </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default ImageCropUpload;
