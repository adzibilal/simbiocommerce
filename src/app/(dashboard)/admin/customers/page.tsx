import React from "react";
import { getCustomers } from "@/app/actions/customer";

const CustomersPage = async () => {
  const customers = await getCustomers();

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Customers</h1>
        <p className="text-custom-sm text-body">
          Manage your customer database.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-1 duration-150">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue/10 rounded-full flex items-center justify-center text-blue font-bold">
                      {customer.name ? customer.name.split(" ").map((n: string) => n[0]).join("") : "?"}
                    </div>
                    <span className="text-custom-sm font-medium text-dark">
                      {customer.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {customer.phone || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-custom-xs font-semibold rounded-full ${
                        customer.status === "Active"
                          ? "bg-green/10 text-green"
                          : customer.status === "Inactive"
                          ? "bg-gray-4/10 text-gray-5"
                          : "bg-red/10 text-red"
                      }`}
                    >
                      {customer.status || "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-blue hover:text-blue-dark duration-200">
                      View
                    </button>
                    <button className="text-red hover:text-red-dark duration-200">
                      Block
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

export default CustomersPage;
