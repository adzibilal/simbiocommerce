"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { createCoupon, updateCoupon, deleteCoupon } from "@/app/actions/coupon";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import { createPortal } from "react-dom";

interface Coupon {
  id: string;
  code: string;
  discount: string;
  type: string;
  expiry: string;
  status: string | null;
  maxUsage?: number | null;
}

interface CouponManagerProps {
  initialCoupons: Coupon[];
}

const CouponManager = ({ initialCoupons }: CouponManagerProps) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null);
  
  // Form state
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState("percentage");
  const [expiry, setExpiry] = useState<Date | undefined>(new Date());
  const [status, setStatus] = useState("active");
  const [maxUsage, setMaxUsage] = useState("0");

  // UI state for custom selects and date picker
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Refs for closing dropdowns on outside click
  const typeRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentCoupon(null);
    setCode("");
    setDiscount("");
    setType("percentage");
    setExpiry(new Date());
    setStatus("active");
    setMaxUsage("0");
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setIsEditing(true);
    setCurrentCoupon(coupon);
    setCode(coupon.code);
    setDiscount(coupon.discount);
    setType(coupon.type || "percentage");
    setExpiry(coupon.expiry ? new Date(coupon.expiry) : new Date());
    setStatus(coupon.status || "active");
    setMaxUsage(coupon.maxUsage?.toString() || "0");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expiry) {
      toast.error("Please select an expiry date");
      return;
    }

    // Validasi Diskon
    const discountNum = parseFloat(discount);
    if (isNaN(discountNum)) {
      toast.error("Please enter a valid number for discount");
      return;
    }

    if (type === "percentage") {
      if (discountNum < 1 || discountNum > 100) {
        toast.error("Percentage discount must be between 1% and 100%");
        return;
      }
    } else {
      if (discountNum < 1) {
        toast.error("Flat discount must be at least 1");
        return;
      }
    }

    // Validasi Tanggal
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset waktu ke awal hari
    const expiryCopy = new Date(expiry);
    expiryCopy.setHours(0, 0, 0, 0);

    if (expiryCopy < today) {
      toast.error("Expiry date cannot be in the past");
      return;
    }

    // Validasi Max Usage
    const maxUsageNum = parseInt(maxUsage);
    if (isNaN(maxUsageNum) || maxUsageNum < 0) {
      toast.error("Max usage must be a valid positive number or 0");
      return;
    }

    toast.loading("Saving coupon...", { id: "coupon-toast" });
    
    try {
      const data = { 
        code, 
        discount, 
        type, 
        expiry: format(expiry, "yyyy-MM-dd"), 
        status,
        maxUsage: maxUsageNum
      };
      
      const res = isEditing && currentCoupon 
        ? await updateCoupon(currentCoupon.id, data)
        : await createCoupon(data);
        
      if (!res.success) {
        toast.error(res.error, { id: "coupon-toast" });
        return;
      }
      
      toast.success(isEditing ? "Coupon updated successfully!" : "Coupon created successfully!", { id: "coupon-toast" });
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save coupon", { id: "coupon-toast" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    
    toast.loading("Deleting coupon...", { id: "coupon-toast" });
    try {
      await deleteCoupon(id);
      toast.success("Coupon deleted successfully!", { id: "coupon-toast" });
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete coupon", { id: "coupon-toast" });
    }
  };

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Coupons</h1>
          <p className="text-custom-sm text-body">Manage discount coupons.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 font-medium text-white bg-blue py-2.5 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Max Usage</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3">
              {initialCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-1 duration-150">
                  <td className="px-6 py-4 text-custom-sm font-medium text-dark">
                    {coupon.code}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body capitalize">
                    {coupon.type}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {coupon.type === "percentage" ? `${coupon.discount}%` : `Rp ${parseInt(coupon.discount).toLocaleString()}`}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {coupon.maxUsage === 0 || !coupon.maxUsage ? "Unlimited" : coupon.maxUsage}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {coupon.expiry}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-custom-xs font-semibold rounded-full ${coupon.status === "active" ? "bg-green/10 text-green" : "bg-red/10 text-red"}`}>
                      {coupon.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => openEditModal(coupon)}
                      className="text-blue hover:text-blue-dark duration-200"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(coupon.id)}
                      className="text-red hover:text-red-dark duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {initialCoupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-body text-custom-sm">
                    No coupons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Rendered via Portal to body */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-euclid-circular-a">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-3 relative">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-dark">
                {isEditing ? "Edit Coupon" : "Add New Coupon"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-body hover:text-dark"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-custom-sm font-medium text-dark mb-1">Code</label>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm font-medium"
                  placeholder="e.g. SUMMER10"
                  required
                />
              </div>

              {/* Type (Custom Select) */}
              <div className="relative" ref={typeRef}>
                <label className="block text-custom-sm font-medium text-dark mb-1">Type</label>
                <button
                  type="button"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm text-left flex justify-between items-center bg-white"
                >
                  <span className="capitalize">{type}</span>
                  <svg className={`w-4 h-4 transform transition-transform ${isTypeDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isTypeDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-3 rounded-lg shadow-2 py-1">
                    <button
                      type="button"
                      onClick={() => { setType("percentage"); setIsTypeDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-left text-custom-sm hover:bg-gray-1 text-dark"
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setType("flat"); setIsTypeDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-left text-custom-sm hover:bg-gray-1 text-dark"
                    >
                      Flat (Amount)
                    </button>
                  </div>
                )}
              </div>

              {/* Discount */}
              <div>
                <label className="block text-custom-sm font-medium text-dark mb-1">
                  Discount {type === "percentage" ? "(%)" : "(Rp)"}
                </label>
                <input 
                  type="number" 
                  value={discount} 
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                  placeholder={type === "percentage" ? "e.g. 10" : "e.g. 50000"}
                  min={1}
                  max={type === "percentage" ? 100 : undefined}
                  required
                />
              </div>

              {/* Max Usage */}
              <div>
                <label className="block text-custom-sm font-medium text-dark mb-1">
                  Max Usage <span className="text-body font-normal">(0 for unlimited)</span>
                </label>
                <input 
                  type="number" 
                  value={maxUsage} 
                  onChange={(e) => setMaxUsage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm"
                  placeholder="e.g. 100"
                  min={0}
                  required
                />
              </div>

              {/* Expiry Date (Custom Calendar) */}
              <div className="relative" ref={dateRef}>
                <label className="block text-custom-sm font-medium text-dark mb-1">Expiry Date</label>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm text-left flex justify-between items-center bg-white"
                >
                  <span>{expiry ? format(expiry, "PPP") : "Select Date"}</span>
                  <svg className="w-5 h-5 text-body" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                {isDatePickerOpen && (
                  <div className="absolute z-20 mt-1 bg-white border border-gray-3 rounded-lg shadow-3 p-2 left-0 right-0 md:left-auto md:right-0">
                    <DayPicker
                      mode="single"
                      selected={expiry}
                      onSelect={(date) => {
                        setExpiry(date);
                        setIsDatePickerOpen(false);
                      }}
                      disabled={{ before: new Date() }}
                      className="mx-auto"
                    />
                  </div>
                )}
              </div>

              {/* Status (Custom Select) */}
              <div className="relative" ref={statusRef}>
                <label className="block text-custom-sm font-medium text-dark mb-1">Status</label>
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="w-full px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:border-blue text-custom-sm text-left flex justify-between items-center bg-white"
                >
                  <span className="capitalize">{status}</span>
                  <svg className={`w-4 h-4 transform transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-3 rounded-lg shadow-2 py-1">
                    <button
                      type="button"
                      onClick={() => { setStatus("active"); setIsStatusDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-left text-custom-sm hover:bg-gray-1 text-dark"
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStatus("inactive"); setIsStatusDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-left text-custom-sm hover:bg-gray-1 text-dark"
                    >
                      Inactive
                    </button>
                  </div>
                )}
              </div>
              
              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 bg-gray-2 text-dark font-medium rounded-lg hover:bg-gray-3 duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-blue text-white font-medium rounded-lg hover:bg-blue-dark duration-200"
                >
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CouponManager;
