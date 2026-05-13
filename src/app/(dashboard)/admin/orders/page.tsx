import React from "react";
import { getOrders } from "@/app/actions/order";

const OrdersPage = async () => {
  const orders = await getOrders();

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
                    {`$${(order.total / 100).toFixed(2)}`}
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
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-blue hover:text-blue-dark duration-200">
                      View
                    </button>
                    <button className="text-red hover:text-red-dark duration-200">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
