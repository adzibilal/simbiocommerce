"use client";
import { Product } from "@/types/product";
import ProductCard from "@/components/Common/ProductCard";

const SingleItem = ({ item }: { item: Product }) => <ProductCard item={item} />;

export default SingleItem;
