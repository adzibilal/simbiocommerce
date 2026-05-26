"use client";
import { Product } from "@/types/product";
import ProductCard from "@/components/Common/ProductCard";

const ProductItem = ({ item }: { item: Product }) => <ProductCard item={item} />;

export default ProductItem;
