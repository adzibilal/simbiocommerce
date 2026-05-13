"use client";

import React from "react";
import MDEditor, { commands } from '@uiw/react-md-editor';
import { upload } from "@imagekit/next";
import { toast } from "react-hot-toast";

import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  height?: number;
}

const MarkdownEditor = ({ value, onChange, height = 500 }: MarkdownEditorProps) => {
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

  return (
    <div data-color-mode="light" className="custom-md-editor">
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
        value={value}
        onChange={(val) => onChange(val || "")}
        height={height}
        preview="live"
        commands={[...commands.getCommands().filter(cmd => cmd.name !== 'image'), imageUploadCommand]}
      />
    </div>
  );
};

export default MarkdownEditor;
