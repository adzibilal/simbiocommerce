"use client";

import React, { useEffect, useState } from "react";
import StatCards from "@/components/Dashboard/StatCards";
import { getRecentOrders, getTopProducts } from "@/app/actions/dashboard";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { formatCurrency } from "@/lib/currency";

const DashboardHome = () => {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [ordersResult, productsResult] = await Promise.all([
        getRecentOrders(5),
        getTopProducts(5),
      ]);

      if (ordersResult.success) {
        setRecentOrders(ordersResult.orders);
      }

      if (productsResult.success) {
        setTopProducts(productsResult.products);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Dashboard</h1>
        <p className="text-custom-sm text-body">
          Welcome back, Admin! Here's what's happening today.
        </p>
      </div>

      {/* Stat Cards */}
      <StatCards />

      {/* Recent Activity / Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-custom-lg font-bold text-dark">Recent Orders</h2>
            <a
              href="/admin/orders"
              className="text-custom-sm text-blue hover:text-blue-dark duration-200"
            >
              View All
            </a>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-4 text-body">No orders yet</div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-2 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue/10 flex items-center justify-center text-blue font-bold">
                      {getInitials(order.customerName)}
                    </div>
                    <div>
                      <span className="text-custom-sm font-medium text-dark">
                        {order.customerName || "Guest"}
                      </span>
                      <p className="text-custom-xs text-body">
                        {formatDistanceToNow(new Date(order.orderDate), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-custom-sm font-bold text-dark">
                    {formatCurrency(order.grandTotal)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-custom-lg font-bold text-dark">Top Products</h2>
            <a
              href="/admin/products"
              className="text-custom-sm text-blue hover:text-blue-dark duration-200"
            >
              View All
            </a>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : topProducts.length === 0 ? (
              <div className="text-center py-4 text-body">No products yet</div>
            ) : (
              topProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-gray-2 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-dark-5 border border-gray-3 overflow-hidden">
                      📦
                    </div>
                    <div>
                      <span className="text-custom-sm font-medium text-dark">
                        {product.name}
                      </span>
                      <p className="text-custom-xs text-body">
                        Stock: {product.stock}
                      </p>
                    </div>
                  </div>
                  <span className="text-custom-sm font-bold text-dark">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
