import React from "react";
import ProductTable from "@/components/Dashboard/ProductTable";
import { getProducts } from "@/app/actions/product";
import Link from "next/link";
import Pagination from "@/components/Dashboard/Pagination";

const PER_PAGE = 20;

const ProductsPage = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const { data: products, total } = await getProducts(page, PER_PAGE);
  const totalPages = Math.ceil(total / PER_PAGE);

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

      <div className="bg-white rounded-2xl shadow-1 border border-gray-2 px-6">
        <div className="flex items-center justify-between py-3">
          <p className="text-custom-xs text-body">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total} products
          </p>
          <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/products" />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
