"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { upload } from "@imagekit/next";
import { toast } from "react-hot-toast";
import MDEditor, { commands } from '@uiw/react-md-editor';
import { createPost, updatePost } from "@/app/actions/post";

import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PostFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    title: string;
    slug: string;
    content?: string;
    featuredImage?: string;
    categoryId?: string;
    status?: string;
    metaTitle?: string;
    metaDescription?: string;
  };
}

const PostForm = ({ categories, initialData }: PostFormProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  
  // UI state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Custom command for image upload in Markdown
  const imageUploadCommand = {
    name: "upload-image",
    keyCommand: "upload-image",
    buttonProps: { "aria-label": "Insert image" },
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!initialData) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    toast.loading("Uploading image...", { id: "upload-toast" });

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
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
      });

      setFeaturedImage(uploadResponse.url);
      toast.success("Image uploaded successfully!", { id: "upload-toast" });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed!", { id: "upload-toast" });
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sessionUserId = session?.user && 'id' in session.user ? (session.user as { id: string }).id : null;
    
    if (!sessionUserId) {
      toast.error("You must be logged in to create a post");
      return;
    }

    toast.loading("Saving post...", { id: "save-toast" });

    try {
      const data = {
        title,
        slug,
        content,
        featuredImage: featuredImage || undefined,
        categoryId: categoryId || undefined,
        authorId: sessionUserId,
        status,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
      };

      const res = initialData 
        ? await updatePost(initialData.id, data)
        : await createPost(data);

      if (!res.success) {
        toast.error(res.error, { id: "save-toast" });
        return;
      }

      toast.success(initialData ? "Post updated successfully!" : "Post created successfully!", { id: "save-toast" });
      router.push("/admin/posts");
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save post", { id: "save-toast" });
    }
  };

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">
          {initialData ? "Edit Post" : "Add New Post"}
        </h1>
        <p className="text-custom-sm text-body">
          {initialData ? "Update post details." : "Create a new blog post."}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-custom-sm font-medium text-dark mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={handleTitleChange}
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="Enter post title"
              required
            />
          </div>

          {/* Slug */}
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

          {/* Featured Image */}
          <div>
            <label className="block text-custom-sm font-medium text-dark mb-2">
              Featured Image
            </label>
            
            {featuredImage && (
              <div className="relative mb-4 rounded-lg overflow-hidden border border-gray-3 max-w-md">
                <img src={featuredImage} alt="Featured" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => setFeaturedImage("")}
                  className="absolute top-2 right-2 bg-red text-white p-1 rounded-full hover:bg-red-dark"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-3 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-1 hover:bg-gray-2 duration-200 cursor-pointer"
            >
              <svg className="w-10 h-10 text-gray-4 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-custom-sm text-body">
                {uploading ? `Uploading... ${Math.round(progress)}%` : "Click to upload featured image"}
              </p>
              <p className="text-custom-xs text-body mt-1">PNG, JPG up to 10MB</p>
            </div>
          </div>

          {/* Content (MD Editor) */}
          <div data-color-mode="light" className="custom-md-editor">
            <label htmlFor="content" className="block text-custom-sm font-medium text-dark mb-2">
              Content
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
              value={content}
              onChange={(val) => setContent(val || "")}
              height={500}
              preview="live"
              commands={[...commands.getCommands().filter(cmd => cmd.name !== 'image'), imageUploadCommand]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-custom-sm font-medium text-dark mb-2">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="border-t border-gray-3 pt-5 mt-5">
            <h3 className="text-base font-bold text-dark mb-4">SEO Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="metaTitle" className="block text-custom-sm font-medium text-dark mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  placeholder="Enter meta title"
                />
              </div>
              
              <div>
                <label htmlFor="metaDescription" className="block text-custom-sm font-medium text-dark mb-2">
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  placeholder="Enter meta description"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark"
            >
              {initialData ? "Update Post" : "Save Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;
