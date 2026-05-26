"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import MarkdownEditor from "@/components/Dashboard/MarkdownEditor";
import { savePageContent, type PageSlug } from "@/app/actions/pages";

interface PageContentEditorProps {
  slug: PageSlug;
  title: string;
  description: string;
  initialContent: string;
  previewUrl: string;
}

export default function PageContentEditor({
  slug,
  title,
  description,
  initialContent,
  previewUrl,
}: PageContentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await savePageContent(slug, content);
    if (result.success) {
      toast.success("Page saved successfully!");
    } else {
      toast.error(result.error || "Failed to save page");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">{title}</h1>
          <p className="text-custom-sm text-body">{description}</p>
        </div>
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1.5 text-custom-sm text-blue hover:text-blue-dark duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
          Preview
        </a>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
        <MarkdownEditor value={content} onChange={setContent} height={550} />

        <div className="flex justify-end mt-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : "Save Page"}
          </button>
        </div>
      </div>
    </div>
  );
}
