"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@imagekit/next";
import { toast } from "react-hot-toast";
import { createProduct, updateProduct } from "@/app/actions/product";
import MDEditor, { commands } from '@uiw/react-md-editor';

// Import CSS for MD Editor
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    name: string;
    slug: string;
    sku?: string;
    price: number;
    weight: number;
    stock: number;
    categoryId: string;
    description?: string;
    isActive: boolean;
    images: { imageUrl: string; isPrimary: boolean }[];
  };
}

const ProductForm = ({ categories, initialData }: ProductFormProps) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [price, setPrice] = useState(initialData ? initialData.price.toString() : "");
  const [weight, setWeight] = useState(initialData?.weight?.toString() || "");
  const [stock, setStock] = useState(initialData?.stock?.toString() || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isActive, setIsActive] = useState(initialData?.isActive !== undefined ? initialData.isActive : true);
  
  // UI state
  const [images, setImages] = useState<{ imageUrl: string; isPrimary: boolean }[]>(initialData?.images || []);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Custom command for image upload in Markdown
  const imageUploadCommand = {
    name: "upload-image",
    keyCommand: "upload-image",
    buttonProps: { "aria-label": "Insert image" },
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
      </svg>
    ),
    execute: (state: any, api: any) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        toast.loading("Uploading image to content...", { id: "content-upload-toast" });

        try {
          const response = await fetch("/api/upload-auth");
          if (!response.ok) throw new Error("Failed to get auth params");
          const authData = await response.json();
          const { signature, expire, token, publicKey, folder } = authData;

          const uploadResponse = await upload({
            file,
            fileName: file.name,
            publicKey,
            signature,
            expire,
            token,
            folder: folder,
          });

          api.replaceSelection(`![${file.name}](${uploadResponse.url})`);
          toast.success("Image inserted!", { id: "content-upload-toast" });
        } catch (error) {
          console.error("Upload error:", error);
          toast.error("Upload failed!", { id: "content-upload-toast" });
        }
      };
      input.click();
    },
  };

  // Auto-generate slug from name (only if creating or slug is empty)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!initialData) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    toast.loading("Uploading image...", { id: "upload-toast" });

    try {
      // Get auth params
      const response = await fetch("/api/upload-auth");
      if (!response.ok) throw new Error("Failed to get auth params");
      const authData = await response.json();
      const { signature, expire, token, publicKey, folder } = authData;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
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

        setImages(prev => [
          ...prev, 
          { imageUrl: uploadResponse.url, isPrimary: prev.length === 0 }
        ]);
      }
      
      toast.success("Images uploaded successfully!", { id: "upload-toast" });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed!", { id: "upload-toast" });
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index: number) => {
    setImages(prev => prev.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    toast.loading("Saving product...", { id: "save-toast" });

    try {
      const data = {
        name,
        slug,
        sku: sku || undefined,
        price: Math.round(parseFloat(price)), // Store in Rupiah
        weight: parseInt(weight),
        stock: parseInt(stock),
        categoryId,
        description,
        isActive,
      };

      const res = initialData 
        ? await updateProduct(initialData.id, data, images)
        : await createProduct(data, images);

      if (!res.success) {
        toast.error(res.error, { id: "save-toast" });
        return;
      }

      toast.success(initialData ? "Product updated successfully!" : "Product created successfully!", { id: "save-toast" });
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save product", { id: "save-toast" });
    }
  };

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">
          {initialData ? "Edit Product" : "Add New Product"}
        </h1>
        <p className="text-custom-sm text-body">
          {initialData ? "Update product details." : "Create a new product listing."}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-custom-sm font-medium text-dark mb-2">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="e.g. Wireless Headphones"
              required
            />
          </div>

          {/* Slug & SKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="slug" className="block text-custom-sm font-medium text-dark mb-2">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                placeholder="auto-generated-slug"
                required
              />
            </div>
            <div>
              <label htmlFor="sku" className="block text-custom-sm font-medium text-dark mb-2">
                SKU (Optional)
              </label>
              <input
                type="text"
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                placeholder="e.g. WH-1000XM4"
              />
            </div>
          </div>

          {/* Description (Markdown Editor) */}
          <div data-color-mode="light" className="custom-md-editor">
            <label htmlFor="description" className="block text-custom-sm font-medium text-dark mb-2">
              Description
            </label>
            <style>{`
              .custom-md-editor .w-md-editor {
                border-radius: 12px !important;
                border: 1px solid #E2E8F0 !important;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
                overflow: hidden;
              }
              .custom-md-editor .w-md-editor-toolbar {
                background-color: #F8FAFC !important;
                border-bottom: 1px solid #E2E8F0 !important;
                padding: 8px !important;
              }
              .custom-md-editor .w-md-editor-toolbar button {
                color: #475569 !important;
                border-radius: 6px !important;
                margin: 0 2px !important;
              }
              .custom-md-editor .w-md-editor-toolbar button:hover {
                background-color: #F1F5F9 !important;
                color: #0F172A !important;
              }
              .custom-md-editor .w-md-editor-toolbar button.active {
                background-color: #E2E8F0 !important;
                color: #0F172A !important;
              }
              .custom-md-editor .w-md-editor-content {
                background-color: #FFFFFF !important;
              }
              .custom-md-editor .w-md-editor-preview {
                background-color: #FFFFFF !important;
                border-left: 1px solid #E2E8F0 !important;
                padding: 20px !important;
              }
            `}</style>
            <MDEditor
              value={description}
              onChange={(val) => setDescription(val || "")}
              height={400}
              preview="live"
              commands={[...commands.getCommands().filter(cmd => cmd.name !== 'image'), imageUploadCommand]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-custom-sm font-medium text-dark mb-2">
                Price (Rp)
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                placeholder="e.g. 150000"
                required
              />
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-custom-sm font-medium text-dark mb-2">
                Weight (Grams)
              </label>
              <input
                type="number"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                placeholder="e.g. 500"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-custom-sm font-medium text-dark mb-2">
                Category
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="stock" className="block text-custom-sm font-medium text-dark mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              id="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="e.g. 100"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-custom-sm font-medium text-dark mb-2">
              Product Images
            </label>
            
            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.map((img, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-3">
                  <img src={img.imageUrl} alt="Product" className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 duration-200 flex flex-col items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className={`text-custom-xs font-medium px-2 py-1 rounded ${img.isPrimary ? "bg-green text-white" : "bg-white text-dark hover:bg-gray-1"}`}
                    >
                      {img.isPrimary ? "Primary" : "Set Primary"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-custom-xs font-medium bg-red text-white px-2 py-1 rounded hover:bg-red-dark"
                    >
                      Remove
                    </button>
                  </div>
                  {img.isPrimary && (
                    <span className="absolute top-2 left-2 bg-green text-white text-custom-xs font-bold px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              multiple
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-3 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-1 hover:bg-gray-2 duration-200 cursor-pointer"
            >
              <svg className="w-10 h-10 text-gray-4 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <p className="text-custom-sm text-body">
                {uploading ? `Uploading... ${Math.round(progress)}%` : "Click to upload or drag and drop"}
              </p>
              <p className="text-custom-xs text-body mt-1">PNG, JPG, SVG up to 10MB</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark"
            >
              {initialData ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
