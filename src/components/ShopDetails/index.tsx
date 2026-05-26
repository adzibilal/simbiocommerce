"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { formatCurrency } from "@/lib/currency";
import Newsletter from "../Common/Newsletter";
import ProductCard from "../Common/ProductCard";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/hooks/useWishlist";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

const FALLBACK = "/images/products/product-1-bg-1.png";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  imageUrl: string | null;
  date: string | null;
  customerName: string | null;
};

type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number | null;
  weight: number;
  description: string | null;
  isActive: boolean | null;
  categoryId: string | null;
  sku: string | null;
  category: string | null;
  imageUrl?: string;
  images: string[];
};

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    width="16" height="16" viewBox="0 0 16 16" fill="none"
    className={filled ? "text-yellow-400 fill-current" : "text-gray-300 fill-current"}
  >
    <path d="M8 1l1.854 3.756L14 5.528l-3 2.924.708 4.131L8 10.51l-3.708 1.953L5 8.452 2 5.528l4.146-.772L8 1z" />
  </svg>
);

const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <StarIcon key={s} filled={s <= Math.round(rating)} />
    ))}
  </div>
);

const ShopDetails = ({
  product,
  reviews,
  relatedProducts = [],
}: {
  product: ProductDetail;
  reviews: Review[];
  relatedProducts?: any[];
}) => {
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
      ? [product.imageUrl]
      : [FALLBACK];

  const router = useRouter();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const { track: trackView } = useRecentlyViewed();
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    trackView(product.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [reviewImg, setReviewImg] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
  const dispatch = useDispatch<AppDispatch>();

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl,
        weight: product.weight,
        stock: product.stock,
      })
    );
  };

  const handleWishlist = () => toggleWishlist(product.id);

  const imgSrc = imgError ? FALLBACK : images[activeImg] || FALLBACK;

  return (
    <>
      <section className="pt-[209px] sm:pt-[155px] lg:pt-[95px] xl:pt-[165px] pb-10 lg:pb-16">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-blue transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-blue transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-dark font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>

          {/* Product layout */}
          <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 items-start">
            {/* Left: images — sticky */}
            <div className="lg:w-[480px] shrink-0 lg:sticky lg:top-24">
              {/* Main image */}
              <div
                className="relative aspect-square rounded-2xl overflow-hidden bg-[#F6F7FB] mb-4 cursor-zoom-in group"
                onClick={() => { setLightboxIdx(activeImg); setLightbox(true); }}
              >
                <Image
                  src={imgSrc}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={() => setImgError(true)}
                  sizes="(max-width: 1024px) 100vw, 480px"
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-black/40 rounded-full p-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
                    </svg>
                  </div>
                </div>
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveImg(i); setImgError(false); }}
                      className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                        i === activeImg ? "border-blue" : "border-transparent"
                      }`}
                    >
                      <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: info + tabs */}
            <div className="flex-1 min-w-0">
              {product.category && (
                <span className="inline-block bg-blue/10 text-blue text-xs font-medium px-3 py-1 rounded-full mb-3">
                  {product.category}
                </span>
              )}

              <h1 className="text-2xl sm:text-3xl font-bold text-dark leading-snug mb-3">
                {product.name}
              </h1>

              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={avgRating} />
                  <span className="text-sm text-gray-500">
                    {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                  </span>
                </div>
              )}

              <div className="text-3xl font-bold text-dark mb-4">
                {formatCurrency(product.price)}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                <span>
                  <span className="font-medium text-dark">Stock:</span>{" "}
                  {product.stock === 0 ? (
                    <span className="text-red-500">Out of stock</span>
                  ) : (
                    <span className="text-green-600">{product.stock ?? "∞"} available</span>
                  )}
                </span>
                {product.weight && (
                  <span>
                    <span className="font-medium text-dark">Weight:</span> {product.weight}g
                  </span>
                )}
              </div>

              {/* Quantity + CTA — 1 line */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-9 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium">−</button>
                  <span className="w-10 text-center text-dark font-semibold text-sm">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="w-9 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium">+</button>
                </div>
                <button
                  onClick={() => { handleAddToCart(); router.push("/checkout"); }}
                  disabled={product.stock === 0}
                  className="flex-1 py-3 px-6 rounded-xl bg-blue text-white font-semibold hover:bg-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 py-3 px-6 rounded-xl border-2 border-blue text-blue font-semibold hover:bg-blue/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleWishlist}
                  aria-label="Add to wishlist"
                  className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors ${isWishlisted(product.id) ? "text-red" : "text-gray-400 hover:text-blue"}`}
                >
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 16 16">
                    <path fillRule="evenodd" clipRule="evenodd" d="M3.75 2.95C2.644 3.455 1.833 4.657 1.833 6.091c0 1.465.6 2.594 1.459 3.562C4 10.45 4.858 11.112 5.694 11.756l.59.459c.35.276.663.519.965.695.301.176.544.257.75.257.207 0 .45-.081.751-.257.302-.176.615-.42.966-.695l.59-.459c.836-.644 1.694-1.306 2.402-2.103.859-.968 1.459-2.097 1.459-3.562 0-1.434-.81-2.636-1.916-3.142-1.075-.49-2.518-.36-3.89 1.066a.5.5 0 0 1-.722 0C5.268 2.59 3.824 2.46 2.75 2.95ZM8 2.973C6.459 1.594 4.733 1.4 3.334 2.04 1.856 2.715.833 4.283.833 6.091c0 1.768.74 3.124 1.711 4.217.778.875 1.729 1.608 2.57 2.255l.581.435c.342.27.709.557 1.081.775.37.217.794.394 1.224.394.43 0 .854-.177 1.224-.394.372-.218.739-.505 1.081-.775l.581-.435c.841-.647 1.792-1.38 2.57-2.255C14.427 9.215 15.167 7.86 15.167 6.09c0-1.808-.974-3.376-2.451-4.051-1.399-.64-3.125-.447-4.666.934Z" />
                  </svg>
                </button>
              </div>

              {/* Tabs — inside right column */}
              <div>
                <div className="flex border-b border-transparent mb-6">
                  {(["description", "reviews"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                        activeTab === tab
                          ? "border-blue text-blue"
                          : "border-transparent text-gray-500 hover:text-dark"
                      }`}
                    >
                      {tab === "reviews" ? `Reviews (${reviews.length})` : "Description"}
                    </button>
                  ))}
                </div>

                {activeTab === "description" && (
                  <div className="[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-dark [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-dark [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-dark [&_h3]:mb-2 [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_li]:text-gray-600 [&_li]:mb-1 [&_strong]:text-dark [&_strong]:font-semibold [&_a]:text-blue [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-blue [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500">
                    {product.description ? (
                      <ReactMarkdown>{product.description}</ReactMarkdown>
                    ) : (
                      <p className="text-gray-400 italic">No description available.</p>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    {reviews.length === 0 ? (
                      <p className="text-gray-400 italic">No reviews yet.</p>
                    ) : (
                      <div className="space-y-6">
                        {/* Rating summary */}
                        <div className="flex items-center gap-6 pb-6 border-b border-gray-2">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-dark">{avgRating.toFixed(1)}</div>
                            <StarRating rating={avgRating} />
                            <p className="text-xs text-gray-500 mt-1">{reviews.length} reviews</p>
                          </div>
                          <div className="flex-1 space-y-1.5">
                            {ratingCounts.map(({ star, count }) => (
                              <div key={star} className="flex items-center gap-2 text-sm">
                                <span className="w-3 text-right text-gray-600">{star}</span>
                                <svg width="11" height="11" viewBox="0 0 16 16" className="text-yellow-400 fill-current shrink-0">
                                  <path d="M8 1l1.854 3.756L14 5.528l-3 2.924.708 4.131L8 10.51l-3.708 1.953L5 8.452 2 5.528l4.146-.772L8 1z" />
                                </svg>
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }} />
                                </div>
                                <span className="w-4 text-gray-500 text-xs">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Review list */}
                        {reviews.map((r) => (
                          <div key={r.id} className="border-b border-gray-2 pb-6 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue/10 flex items-center justify-center text-blue font-semibold text-sm">
                                  {(r.customerName || "A").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-dark text-sm">{r.customerName || "Anonymous"}</p>
                                  <p className="text-xs text-gray-400">
                                    {r.date ? new Date(r.date).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : ""}
                                  </p>
                                </div>
                              </div>
                              <StarRating rating={r.rating} />
                            </div>
                            {r.comment && <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>}
                            {r.imageUrl && (
                              <button
                                type="button"
                                onClick={() => setReviewImg(r.imageUrl!)}
                                className="mt-2 w-24 h-24 rounded-lg overflow-hidden shadow-md cursor-zoom-in block"
                              >
                                <Image src={r.imageUrl} alt="Review photo" width={96} height={96} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="py-14">
          <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-dark">Other Products</h2>
              <Link href="/shop" className="text-sm font-medium text-blue hover:underline">
                View More →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {relatedProducts.slice(0, 4).map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Newsletter />

      {/* Lightbox */}
      {lightbox && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99999, backgroundColor: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setLightbox(false)}
        >
          {/* Close */}
          <button
            style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}
            onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", zIndex: 1 }}
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i - 1 + images.length) % images.length); }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            style={{ position: "relative", width: "calc(100% - 120px)", height: "90vh", maxWidth: 900 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIdx] || FALLBACK}
              alt={`${product.name} ${lightboxIdx + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", zIndex: 1 }}
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i + 1) % images.length); }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, alignItems: "center" }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                  style={{ border: "none", cursor: "pointer", borderRadius: 99, background: i === lightboxIdx ? "white" : "rgba(255,255,255,0.35)", width: i === lightboxIdx ? 20 : 8, height: 8, padding: 0, transition: "all 0.2s" }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review image popup */}
      {reviewImg && (
        <div
          className="fixed inset-0 z-99999 bg-dark/80 flex items-center justify-center p-4"
          onClick={() => setReviewImg(null)}
        >
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setReviewImg(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <img src={reviewImg} alt="Review" className="w-full h-auto rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </>
  );
};

export default ShopDetails;
