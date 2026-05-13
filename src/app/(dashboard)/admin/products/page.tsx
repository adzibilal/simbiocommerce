import React from "react";
import ProductTable from "@/components/Dashboard/ProductTable";
import { getProducts } from "@/app/actions/product";
import Link from "next/link";

const ProductsPage = async () => {
  const products = await getProducts();

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Products</h1>
          <p className="text-custom-sm text-body">
            Manage your products here.
          </p>
        </div>
        <Link href="/admin/add-product" className="flex items-center gap-2 font-medium text-white bg-blue py-2.5 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark">
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
          Add Product
        </Link>
      </div>

      {/* Product Table */}
      <ProductTable products={products} />
    </div>
  );
};

export default ProductsPage;
