import type { Metadata } from "next";
export const metadata: Metadata = { title: "Orders" };

import React from "react";
import { getOrders } from "@/app/actions/order";
import { formatCurrency } from "@/lib/currency";
import Link from "next/link";
import Pagination from "@/components/Dashboard/Pagination";

const PER_PAGE = 20;

const OrdersPage = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const { data: orders, total } = await getOrders(page, PER_PAGE);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Orders</h1>
        <p className="text-custom-sm text-body">
          Manage and track your customer orders.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-1 duration-150">
                  <td className="px-6 py-4 text-custom-sm font-medium text-dark">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {order.customer || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 text-custom-sm font-medium text-dark">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-custom-xs font-semibold rounded-full ${
                        order.status === "Paid"
                          ? "bg-green/10 text-green"
                          : order.status === "Pending"
                          ? "bg-yellow/10 text-yellow"
                          : order.status === "Cancelled"
                          ? "bg-red/10 text-red"
                          : "bg-blue/10 text-blue"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-blue hover:text-blue-dark duration-200 text-custom-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-2 px-6">
          <div className="flex items-center justify-between py-3">
            <p className="text-custom-xs text-body">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total} orders
            </p>
            <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/orders" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
