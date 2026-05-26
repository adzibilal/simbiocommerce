"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { Product } from "@/types/product";
import { addItemToCart } from "@/redux/features/cart-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { formatCurrency } from "@/lib/currency";
import { useWishlist } from "@/hooks/useWishlist";

const FALLBACK = "/images/products/product-1-bg-1.png";


const HeartIcon = () => (
  <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M3.75 2.95C2.644 3.455 1.833 4.657 1.833 6.091c0 1.465.6 2.594 1.459 3.562C4 10.45 4.858 11.112 5.694 11.756l.59.459c.35.276.663.519.965.695.301.176.544.257.75.257.207 0 .45-.081.751-.257.302-.176.615-.42.966-.695l.59-.459c.836-.644 1.694-1.306 2.402-2.103.859-.968 1.459-2.097 1.459-3.562 0-1.434-.81-2.636-1.916-3.142-1.075-.49-2.518-.36-3.89 1.066a.5.5 0 0 1-.722 0C5.268 2.59 3.824 2.46 2.75 2.95ZM8 2.973C6.459 1.594 4.733 1.4 3.334 2.04 1.856 2.715.833 4.283.833 6.091c0 1.768.74 3.124 1.711 4.217.778.875 1.729 1.608 2.57 2.255l.581.435c.342.27.709.557 1.081.775.37.217.794.394 1.224.394.43 0 .854-.177 1.224-.394.372-.218.739-.505 1.081-.775l.581-.435c.841-.647 1.792-1.38 2.57-2.255C14.427 9.215 15.167 7.86 15.167 6.09c0-1.808-.974-3.376-2.451-4.051-1.399-.64-3.125-.447-4.666.934Z" fill=""/>
  </svg>
);

const CartIcon = () => (
  <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M1.492 1.526a.5.5 0 0 0-.633.346.5.5 0 0 0 .316.648l.176.059c.452.15.75.25.97.352.208.097.298.175.356.255.057.08.102.19.128.418.028.24.028.555.028 1.03v1.781c0 .912 0 1.647.078 2.225.08.6.253 1.105.654 1.506.401.401.907.574 1.507.655.578.077 1.313.077 2.225.077h5.334a.5.5 0 0 0 0-1H7.333c-.957 0-1.624-.001-2.128-.069-.489-.066-.748-.186-.932-.37A.997.997 0 0 1 4.102 9.167h6.604c.299 0 .562 0 .78-.023.236-.025.465-.08.68-.222.216-.142.358-.33.475-.537.107-.193.211-.434.328-.71l.286-.665c.276-.598.49-1.099.597-1.506.112-.424.14-.867-.124-1.268-.264-.4-.683-.548-1.117-.612-.416-.062-.961-.062-1.611-.062H3.804l-.009-.076c-.037-.322-.117-.619-.311-.888-.194-.27-.45-.44-.745-.577-.278-.13-.63-.247-1.048-.386L1.492 1.526Zm2.341 2.974c0 .02 0 .04 0 .061v1.772c0 .781.001 1.37.038 1.833H10.68c.33 0 .538-.001.697-.018.146-.015.202-.04.237-.063.035-.023.081-.064.153-.192.078-.139.16-.33.29-.626l.286-.657c.276-.645.46-1.077.546-1.404.084-.317.042-.413.01-.462-.033-.049-.104-.126-.43-.174-.333-.049-.803-.05-1.503-.05H3.833ZM3.5 13a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm1.5.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1ZM11 14.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0-1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" fill=""/>
  </svg>
);

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const ProductCard = ({ item }: { item: Product }) => {
  const images = item.images && item.images.length > 0
    ? item.images
    : item.imageUrl
    ? [item.imageUrl]
    : [FALLBACK];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();

  const prev =(e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIdx((i) => (i - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIdx((i) => (i + 1) % images.length);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(addItemToCart({ id: item.id, name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl, weight: item.weight, stock: item.stock }));
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(item.id);
  };

  const handleProductDetails = () => {
    dispatch(updateproductDetails({ ...item }));
  };

  const imgSrc = imgError ? FALLBACK : (images[currentIdx] || FALLBACK);

  return (
    <div className="group flex flex-col">
      {/* Image area */}
      <Link href={`/shop-details/${item.slug}`} onClick={handleProductDetails} className="block relative overflow-hidden rounded-xl bg-[#F6F7FB] aspect-square mb-3.5">
        <Image
          src={imgSrc}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center text-dark opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center text-dark opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setCurrentIdx(i); }}
                className={`rounded-full transition-all duration-200 ${
                  i === currentIdx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60"
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Out of stock badge */}
        {item.stock === 0 && (
          <div className="absolute top-2.5 left-2.5 bg-red text-white text-xs font-medium px-2 py-0.5 rounded">
            Out of Stock
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 pb-4 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out z-10">
          <button
            onClick={handleAddToCart}
            className="inline-flex items-center gap-1.5 font-medium text-custom-sm py-2 px-4 rounded-lg bg-blue text-white hover:bg-blue-dark ease-out duration-200"
          >
            <CartIcon />
            Add to cart
          </button>
          <button
            onClick={handleWishlist}
            aria-label="Add to wishlist"
            className={`w-9 h-9 rounded-lg bg-white shadow-1 flex items-center justify-center ease-out duration-200 ${isWishlisted(item.id) ? "text-red bg-red/10" : "text-dark hover:text-white hover:bg-blue"}`}
          >
            <HeartIcon />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-medium text-dark text-sm leading-snug mb-1.5 hover:text-blue ease-out duration-200 line-clamp-2">
          <Link href={`/shop-details/${item.slug}`} onClick={handleProductDetails}>
            {item.name}
          </Link>
        </h3>
        {item.avgRating != null && item.reviewCount != null && item.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-xs text-dark-4">{item.avgRating}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-dark">{formatCurrency(item.price)}</span>
          {item.stock === 0 && (
            <span className="text-red text-xs">Out of stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
