import type { Metadata } from "next";
export const metadata: Metadata = { title: "Orders" };

import React from "react";
import { getOrders } from "@/app/actions/order";
import OrderTable from "@/components/Dashboard/OrderTable";

const PER_PAGE = 20;

const OrdersPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; startDate?: string; endDate?: string }>;
}) => {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const startDate = params.startDate ?? "";
  const endDate = params.endDate ?? "";

  // Convert input datetime-local string to ISO format for database queries
  let startISO = undefined;
  let endISO = undefined;

  if (startDate) {
    try {
      startISO = new Date(startDate).toISOString();
    } catch (e) {
      console.error("Invalid startDate:", startDate);
    }
  }

  if (endDate) {
    try {
      endISO = new Date(endDate).toISOString();
    } catch (e) {
      console.error("Invalid endDate:", endDate);
    }
  }

  const { data: orders, total } = await getOrders(page, PER_PAGE, startISO, endISO);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Orders</h1>
        <p className="text-custom-sm text-body font-normal">
          Manage and track your customer orders.
        </p>
      </div>

      <OrderTable
        orders={orders}
        total={total}
        initialStartDate={startDate}
        initialEndDate={endDate}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
};

export default OrdersPage;
