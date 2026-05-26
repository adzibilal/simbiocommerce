"use client";
import React, { useState, useMemo } from "react";
import ProductCard from "@/components/Common/ProductCard";
import { Product } from "@/types/product";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ShopGridProps {
  products: Product[];
  categories: Category[];
}

const SORT_OPTIONS = [
  { label: "Terbaru", value: "newest" },
  { label: "Harga: Rendah ke Tinggi", value: "price_asc" },
  { label: "Harga: Tinggi ke Rendah", value: "price_desc" },
  { label: "Nama A–Z", value: "name_asc" },
];

const ShopGrid = ({ products, categories }: ShopGridProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "all") {
      result = result.filter((p) => p.categoryId === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    switch (sort) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [products, activeCategory, sort, search]);

  return (
    <section className="py-14 font-euclid-circular-a">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark mb-1">Shop</h1>
          <p className="text-body text-sm">{filtered.length} produk ditemukan</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-7">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-4 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-3 bg-gray-1 text-sm text-dark-4 outline-none focus:border-transparent focus:ring-2 focus:ring-blue/20"
            />
          </div>

          <div className="ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="py-2.5 pl-4 pr-8 rounded-lg border border-gray-3 bg-gray-1 text-sm text-dark-4 outline-none focus:border-transparent focus:ring-2 focus:ring-blue/20 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category tabs */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
                activeCategory === "all"
                  ? "bg-blue text-white"
                  : "bg-gray-1 text-dark-4 hover:bg-gray-2 border border-gray-3"
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
                  activeCategory === cat.id
                    ? "bg-blue text-white"
                    : "bg-gray-1 text-dark-4 hover:bg-gray-2 border border-gray-3"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
            {filtered.map((product) => (
              <ProductCard key={product.id} item={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-body">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-4.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="font-medium text-dark mb-1">Produk tidak ditemukan</p>
            <p className="text-sm">Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopGrid;
