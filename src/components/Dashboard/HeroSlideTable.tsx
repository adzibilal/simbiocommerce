"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { deleteHeroSlide } from "@/app/actions/hero-slide";
import Image from "next/image";

interface HeroSlide {
  id: string;
  imageUrl: string;
  link: string;
  linkType: string | null;
  productId: string | null;
  isNewTab: boolean | null;
  order: number;
  isActive: boolean | null;
  createdAt: string | null;
}

interface HeroSlideTableProps {
  slides: HeroSlide[];
  onEdit: (slide: HeroSlide) => void;
}

const HeroSlideTable = ({ slides, onEdit }: HeroSlideTableProps) => {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;

    toast.loading("Deleting slide...", { id: "delete-toast" });
    try {
      await deleteHeroSlide(id);
      toast.success("Slide deleted successfully!", { id: "delete-toast" });
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete slide", { id: "delete-toast" });
    }
  };

  const handleToggleStatus = async (slide: HeroSlide) => {
    toast.loading("Updating status...", { id: "status-toast" });
    try {
      const { updateHeroSlide } = await import("@/app/actions/hero-slide");
      await updateHeroSlide(slide.id, { isActive: !slide.isActive });
      toast.success("Status updated!", { id: "status-toast" });
      router.refresh();
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status", { id: "status-toast" });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden font-euclid-circular-a">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Slide</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Link</th>
              <th className="px-6 py-4">New Tab</th>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-3">
            {slides.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-dark-4">
                  No slides found. Add your first slide to get started.
                </td>
              </tr>
            ) : (
              slides.map((slide) => (
                <tr key={slide.id} className="hover:bg-gray-1 duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-16 w-28 bg-gray-2 rounded-lg flex items-center justify-center text-dark-5 border border-gray-3 overflow-hidden relative">
                        {slide.imageUrl ? (
                          <Image
                            src={slide.imageUrl}
                            alt="Hero slide"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          "🖼️"
                        )}
                      </div>
                      <span className="text-custom-sm font-medium text-dark truncate max-w-[200px]">
                        {slide.imageUrl.split("/").pop() || "Slide image"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-custom-xs font-semibold rounded-full bg-blue/10 text-blue capitalize">
                      {slide.linkType || "custom"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    <a
                      href={slide.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue hover:underline truncate max-w-[200px] block"
                    >
                      {slide.link}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {slide.isNewTab ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 text-custom-sm font-medium text-dark">
                    {slide.order}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(slide)}
                      className={`inline-flex px-2 py-1 text-custom-xs font-semibold rounded-full cursor-pointer transition-colors ${
                        slide.isActive
                          ? "bg-green/10 text-green hover:bg-green/20"
                          : "bg-red/10 text-red hover:bg-red/20"
                      }`}
                    >
                      {slide.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onEdit(slide)}
                      className="text-blue hover:text-blue-dark duration-200 inline-block"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                        ></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="text-red hover:text-red-dark duration-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        ></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HeroSlideTable;
