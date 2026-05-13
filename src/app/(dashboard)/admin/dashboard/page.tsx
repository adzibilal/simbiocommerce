import React from "react";
import StatCards from "@/components/Dashboard/StatCards";

const DashboardHome = () => {
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
            <button className="text-custom-sm text-blue hover:text-blue-dark duration-200">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {/* Mock Order 1 */}
            <div className="flex items-center justify-between p-4 bg-gray-2 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue/10 flex items-center justify-center text-blue font-bold">
                  JD
                </div>
                <div>
                  <span className="text-custom-sm font-medium text-dark">John Doe</span>
                  <p className="text-custom-xs text-body">2 mins ago</p>
                </div>
              </div>
              <span className="text-custom-sm font-bold text-dark">$120.00</span>
            </div>
            {/* Mock Order 2 */}
            <div className="flex items-center justify-between p-4 bg-gray-2 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue/10 flex items-center justify-center text-blue font-bold">
                  AS
                </div>
                <div>
                  <span className="text-custom-sm font-medium text-dark">Alice Smith</span>
                  <p className="text-custom-xs text-body">15 mins ago</p>
                </div>
              </div>
              <span className="text-custom-sm font-bold text-dark">$85.50</span>
            </div>
            {/* Mock Order 3 */}
            <div className="flex items-center justify-between p-4 bg-gray-2 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue/10 flex items-center justify-center text-blue font-bold">
                  BK
                </div>
                <div>
                  <span className="text-custom-sm font-medium text-dark">Bob King</span>
                  <p className="text-custom-xs text-body">1 hour ago</p>
                </div>
              </div>
              <span className="text-custom-sm font-bold text-dark">$250.00</span>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-custom-lg font-bold text-dark">Top Products</h2>
            <button className="text-custom-sm text-blue hover:text-blue-dark duration-200">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {/* Mock Product 1 */}
            <div className="flex items-center justify-between p-4 bg-gray-2 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-dark-5 border border-gray-3">
                  📦
                </div>
                <div>
                  <span className="text-custom-sm font-medium text-dark">Wireless Headphones</span>
                  <p className="text-custom-xs text-body">45 Sales</p>
                </div>
              </div>
              <span className="text-custom-sm font-bold text-dark">$2,250.00</span>
            </div>
            {/* Mock Product 2 */}
            <div className="flex items-center justify-between p-4 bg-gray-2 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-dark-5 border border-gray-3">
                  📦
                </div>
                <div>
                  <span className="text-custom-sm font-medium text-dark">Smart Watch</span>
                  <p className="text-custom-xs text-body">32 Sales</p>
                </div>
              </div>
              <span className="text-custom-sm font-bold text-dark">$1,600.00</span>
            </div>
            {/* Mock Product 3 */}
            <div className="flex items-center justify-between p-4 bg-gray-2 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-dark-5 border border-gray-3">
                  📦
                </div>
                <div>
                  <span className="text-custom-sm font-medium text-dark">Bluetooth Speaker</span>
                  <p className="text-custom-xs text-body">28 Sales</p>
                </div>
              </div>
              <span className="text-custom-sm font-bold text-dark">$840.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
