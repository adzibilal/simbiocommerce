"use client";
import { Product } from "@/types/product";
import ProductCard from "@/components/Common/ProductCard";

const SingleGridItem = ({ item }: { item: Product }) => <ProductCard item={item} />;

export default SingleGridItem;
