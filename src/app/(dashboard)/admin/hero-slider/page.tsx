"use client";


import React, { useState } from "react";
import { getHeroSlides } from "@/app/actions/hero-slide";
import { getProducts } from "@/app/actions/product";
import HeroSlideTable from "@/components/Dashboard/HeroSlideTable";
import HeroSlideModal from "@/components/Dashboard/HeroSlideModal";

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

interface ProductOption {
  id: string;
  name: string;
  slug: string;
}

const HeroSliderPage = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch slides on mount
  React.useEffect(() => {
    const fetchData = async () => {
      const [slideData, productData] = await Promise.all([
        getHeroSlides(),
        getProducts(),
      ]);
      setSlides(slideData);
      setProducts(productData.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
      })));
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleAddClick = () => {
    setEditingSlide(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlide(null);
    // Refresh slides after modal closes
    const fetchSlides = async () => {
      const data = await getHeroSlides();
      setSlides(data);
    };
    fetchSlides();
  };

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Hero Slider</h1>
          <p className="text-custom-sm text-body">
            Manage the homepage hero slider images and links.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 font-medium text-white bg-blue py-2.5 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Add Slide
        </button>
      </div>

      {/* Instructions Card */}
      <div className="bg-blue/5 border border-blue/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-dark">
            <p className="font-medium mb-1">Tips for best results:</p>
            <ul className="list-disc list-inside text-dark-4 space-y-0.5">
              <li>Use 21:9 aspect ratio images (2560x1080px recommended)</li>
              <li>Keep file sizes under 500KB for fast loading</li>
              <li>Only active slides will be shown on the homepage</li>
              <li>Slides are ordered by the &quot;Order&quot; field (lower first)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Slide Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-dark-4">Loading slides...</p>
        </div>
      ) : (
        <HeroSlideTable slides={slides} onEdit={handleEditClick} />
      )}

      {/* Modal */}
      <HeroSlideModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        slide={editingSlide}
        products={products}
      />
    </div>
  );
};

export default HeroSliderPage;
