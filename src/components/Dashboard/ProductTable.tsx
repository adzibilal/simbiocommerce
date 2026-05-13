"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { deleteProduct } from "@/app/actions/product";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  category: string | null;
  price: number;
  stock: number;
  isActive: boolean | null;
  imageUrl?: string | null;
}

const ProductTable = ({ products }: { products: Product[] }) => {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    toast.loading("Deleting product...", { id: "delete-toast" });
    try {
      const res = await deleteProduct(id);
      if (!res.success) {
        toast.error(res.error, { id: "delete-toast" });
        return;
      }
      toast.success("Product deleted successfully!", { id: "delete-toast" });
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product", { id: "delete-toast" });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden font-euclid-circular-a">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-3">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-1 duration-150">
                <td className="px-6 py-4 flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-2 rounded-lg flex items-center justify-center text-dark-5 border border-gray-3 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      "📦"
                    )}
                  </div>
                  <span className="text-custom-sm font-medium text-dark">
                    {product.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-custom-sm text-body">
                  {product.category || "Uncategorized"}
                </td>
                <td className="px-6 py-4 text-custom-sm font-medium text-dark">
                  {`Rp ${product.price.toLocaleString()}`}
                </td>
                <td className="px-6 py-4 text-custom-sm text-body">
                  {product.stock}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-custom-xs font-semibold rounded-full ${
                      product.isActive
                        ? "bg-green/10 text-green"
                        : "bg-red/10 text-red"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Link 
                    href={`/admin/edit-product/${product.id}`}
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
                  </Link>
                  <button 
                    onClick={() => handleDelete(product.id)}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
