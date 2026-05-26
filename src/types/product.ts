export type Product = {
  id: string;
  name: string;
  price: number; // in IDR (rupiah)
  stock: number;
  weight: number;
  description?: string;
  isActive: boolean;
  categoryId?: string;
  sku?: string;
  slug: string;
  imageUrl?: string;
  images?: string[];
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  avgRating?: number | null;
  reviewCount?: number;
};
