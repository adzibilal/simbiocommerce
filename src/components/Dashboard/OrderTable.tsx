"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/currency";
import { bulkUpdateOrderStatus } from "@/app/actions/order";
import Pagination from "@/components/Dashboard/Pagination";
import ModalPortal from "@/components/Dashboard/ModalPortal";

interface Order {
  id: string;
  customer: string | null;
  date: string | null;
  total: number;
  status: string | null;
}

interface OrderTableProps {
  orders: Order[];
  total: number;
  initialStartDate?: string;
  initialEndDate?: string;
  currentPage: number;
  totalPages: number;
}

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrderTable({
  orders,
  total,
  initialStartDate = "",
  initialEndDate = "",
  currentPage,
  totalPages,
}: OrderTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for filters (datetime-local format: YYYY-MM-DDTHH:mm)
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkScope, setBulkScope] = useState<"selected" | "range">("selected");
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Sync date inputs if URL parameters change
  useEffect(() => {
    setStartDate(initialStartDate);
  }, [initialStartDate]);

  useEffect(() => {
    setEndDate(initialEndDate);
  }, [initialEndDate]);

  // Checkbox handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(orders.map((order) => order.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Filter handlers
  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (startDate) {
      params.set("startDate", startDate);
    } else {
      params.delete("startDate");
    }

    if (endDate) {
      params.set("endDate", endDate);
    } else {
      params.delete("endDate");
    }

    params.set("page", "1"); // Reset to page 1 on filter
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("startDate");
    params.delete("endDate");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Bulk update handler (opens confirmation modal)
  const handleBulkUpdate = () => {
    if (!bulkStatus) {
      toast.error("Please select a status first");
      return;
    }

    const hasActiveFilter = initialStartDate && initialEndDate;
    if (bulkScope === "range" && !hasActiveFilter) {
      toast.error("Date filter must be applied to update by range");
      return;
    }

    setIsConfirmOpen(true);
  };

  const confirmBulkUpdate = async () => {
    setIsConfirmOpen(false);
    setIsUpdating(true);
    toast.loading("Updating order statuses...", { id: "bulk-update-toast" });

    try {
      let startISO = undefined;
      let endISO = undefined;

      if (bulkScope === "range" && initialStartDate && initialEndDate) {
        startISO = new Date(initialStartDate).toISOString();
        endISO = new Date(initialEndDate).toISOString();
      }

      const res = await bulkUpdateOrderStatus({
        ids: bulkScope === "selected" ? selectedIds : undefined,
        dateRange:
          bulkScope === "range" && startISO && endISO
            ? { start: startISO, end: endISO }
            : undefined,
        status: bulkStatus,
      });

      if (res.success) {
        toast.success("Order statuses updated successfully!", {
          id: "bulk-update-toast",
        });
        setSelectedIds([]);
        setBulkStatus("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update orders", {
          id: "bulk-update-toast",
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("An unexpected error occurred", { id: "bulk-update-toast" });
    } finally {
      setIsUpdating(false);
    }
  };

  const isAllSelected =
    orders.length > 0 && orders.every((order) => selectedIds.includes(order.id));
  const hasActiveFilter = initialStartDate !== "" && initialEndDate !== "";
  const showBulkBar = selectedIds.length > 0 || (hasActiveFilter && total > 0);

  // Format date helper for localized display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 font-euclid-circular-a">
      {/* Date Filter Panel */}
      <form
        onSubmit={handleFilter}
        className="bg-white rounded-2xl shadow-1 border border-gray-2 p-6 flex flex-col md:flex-row md:items-end gap-4"
      >
        <div className="flex-1 space-y-2">
          <label className="text-custom-sm font-semibold text-dark">
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-gray-1 rounded-lg border border-gray-3 py-2 px-4 text-dark text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-custom-sm font-semibold text-dark">
            End Date & Time
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-gray-1 rounded-lg border border-gray-3 py-2 px-4 text-dark text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="py-2.5 px-5 bg-blue text-white text-sm font-medium rounded-lg hover:bg-blue-dark transition-colors"
          >
            Filter
          </button>
          {(hasActiveFilter || startDate || endDate) && (
            <button
              type="button"
              onClick={handleResetFilter}
              className="py-2.5 px-5 bg-white border border-gray-3 text-body text-sm font-medium rounded-lg hover:bg-gray-1 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-3 text-blue focus:ring-blue/20 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-body">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isSelected = selectedIds.includes(order.id);
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-gray-1 duration-150 ${
                        isSelected ? "bg-blue/5 hover:bg-blue/5" : ""
                      }`}
                    >
                      <td className="px-6 py-4 w-12">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectRow(order.id, e.target.checked)
                          }
                          className="w-4 h-4 rounded border-gray-3 text-blue focus:ring-blue/20 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 text-custom-sm font-medium text-dark font-mono">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 text-custom-sm text-body">
                        {order.customer || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-custom-sm text-body">
                        {formatDate(order.date)}
                      </td>
                      <td className="px-6 py-4 text-custom-sm font-medium text-dark">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-custom-xs font-semibold rounded-full capitalize ${
                            order.status === "delivered" || order.status === "Paid"
                              ? "bg-green/10 text-green"
                              : order.status === "pending" || order.status === "Pending"
                              ? "bg-yellow/10 text-yellow"
                              : order.status === "cancelled" || order.status === "Cancelled"
                              ? "bg-red/10 text-red"
                              : "bg-blue/10 text-blue"
                          }`}
                        >
                          {order.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-blue hover:text-blue-dark duration-200 text-custom-sm font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-2 px-6">
          <div className="flex items-center justify-between py-3">
            <p className="text-custom-xs text-body">
              Showing {orders.length === 0 ? 0 : (currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, total)} of {total} orders
            </p>
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/admin/orders" />
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {showBulkBar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-999 flex flex-col md:flex-row items-center gap-4 px-6 py-4 rounded-2xl bg-white border border-gray-2 shadow-testimonial animate-slide-up max-w-[90%] md:max-w-max">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-dark">Bulk Update Status</span>
              <span className="text-xs text-body">
                {selectedIds.length} checked · {total} in date range
              </span>
            </div>

            {hasActiveFilter && (
              <div className="flex items-center gap-3 border-l border-gray-3 pl-4">
                <label className="flex items-center gap-1.5 text-xs text-dark font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="bulkScope"
                    checked={bulkScope === "selected"}
                    onChange={() => setBulkScope("selected")}
                    disabled={selectedIds.length === 0}
                    className="w-3.5 h-3.5 text-blue focus:ring-blue/20"
                  />
                  Selected
                </label>
                <label className="flex items-center gap-1.5 text-xs text-dark font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="bulkScope"
                    checked={bulkScope === "range"}
                    onChange={() => setBulkScope("range")}
                    className="w-3.5 h-3.5 text-blue focus:ring-blue/20"
                  />
                  Whole Range
                </label>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedIds([]);
                setBulkScope("selected");
              }}
              className="text-xs font-semibold text-red hover:text-red-dark transition-colors border-l border-gray-3 pl-4"
            >
              Clear
            </button>
          </div>

          <div className="h-px md:h-6 w-full md:w-px bg-gray-3" />

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="bg-gray-1 rounded-lg border border-gray-3 py-2 px-3 text-dark text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 capitalize"
            >
              <option value="" disabled>
                Select Status...
              </option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button
              onClick={handleBulkUpdate}
              disabled={
                isUpdating ||
                !bulkStatus ||
                (bulkScope === "selected" && selectedIds.length === 0)
              }
              className="py-2 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isUpdating ? "Updating..." : "Apply"}
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {isConfirmOpen && (
        <ModalPortal>
          <div className="fixed inset-0 left-0 top-0 z-[99999] flex min-h-[100dvh] w-full items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
              onClick={() => setIsConfirmOpen(false)}
              aria-label="Close modal"
            />
            <div className="relative z-[1] bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4 text-yellow-dark">
                  <svg className="w-8 h-8 text-yellow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-lg font-bold text-dark">Confirm Bulk Action</h3>
                </div>
                <p className="text-custom-sm text-body mb-6">
                  {bulkScope === "range"
                    ? `Are you sure you want to update all ${total} orders in date range to "${bulkStatus}"?`
                    : `Are you sure you want to update ${selectedIds.length} selected orders to "${bulkStatus}"?`}
                </p>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirmOpen(false)}
                    className="px-5 py-2.5 text-dark font-medium rounded-lg border border-gray-3 hover:bg-gray-1 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmBulkUpdate}
                    className="px-5 py-2.5 text-white font-medium rounded-lg bg-blue hover:bg-blue-dark transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
