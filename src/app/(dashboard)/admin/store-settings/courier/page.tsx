"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/Admin/PasswordInput";
import TestConnectionButton from "@/components/Admin/TestConnectionButton";
import {
  getShippingSettings,
  saveShippingSettings,
  testRajaOngkirConnection,
  getShippingOrigins,
  addShippingOrigin,
  updateShippingOrigin,
  deleteShippingOrigin,
  setDefaultOrigin,
} from "@/app/actions/store-settings";
import { searchDomesticDestination, type DomesticDestination } from "@/app/actions/shipping";
import type { ShippingSettings, ShippingOrigin } from "@/types/store-settings";
import toast from "react-hot-toast";

export default function CourierSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ShippingSettings>({ apiKey: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [testWarning, setTestWarning] = useState(false);
  const [origins, setOrigins] = useState<ShippingOrigin[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingOrigin, setEditingOrigin] = useState<ShippingOrigin | null>(null);

  // Modal search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DomesticDestination[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<DomesticDestination | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [modalIsDefault, setModalIsDefault] = useState(false);
  const [modalIsActive, setModalIsActive] = useState(true);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSettings();
    loadOrigins();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getShippingSettings();
      if (settings) setFormData(settings);
    } catch {
      toast.error("Failed to load courier settings");
    } finally {
      setLoading(false);
    }
  };

  const loadOrigins = async () => {
    try {
      const data = await getShippingOrigins();
      setOrigins(data);
    } catch {}
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSelectedDestination(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const result = await searchDomesticDestination(value, 15);
      setSearchResults(result.results);
      setShowResults(true);
      setSearching(false);
    }, 400);
  };

  const handleSelectDestination = (dest: DomesticDestination) => {
    setSelectedDestination(dest);
    setSearchQuery(dest.label);
    setShowResults(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.apiKey || formData.apiKey.length < 10)
      newErrors.apiKey = "API key is required (min 10 characters)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) {
      toast.error("Please fix validation errors first");
      return { success: false, message: "Validation failed" };
    }
    const result = await testRajaOngkirConnection(formData.apiKey);
    setTestWarning(!result.success);
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }
    if (testWarning) {
      const ok = window.confirm("Connection test failed. Are you sure you want to save?");
      if (!ok) return;
    }
    setSaving(true);
    try {
      const result = await saveShippingSettings(formData);
      if (result.success) {
        toast.success("Courier settings saved successfully!");
        setTestWarning(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddOrigin = () => {
    setEditingOrigin(null);
    setSearchQuery("");
    setSelectedDestination(null);
    setSearchResults([]);
    setModalIsDefault(origins.length === 0);
    setModalIsActive(true);
    setShowModal(true);
  };

  const handleEditOrigin = (origin: ShippingOrigin) => {
    setEditingOrigin(origin);
    setSearchQuery(origin.cityName);
    setSelectedDestination({
      id: origin.cityId,
      label: origin.cityName,
      subdistrict_name: "",
      district_name: "",
      city_name: origin.cityName,
      province_name: origin.provinceName,
      zip_code: "",
    });
    setModalIsDefault(origin.isDefault);
    setModalIsActive(origin.isActive);
    setShowModal(true);
  };

  const handleDeleteOrigin = async (id: string) => {
    if (!confirm("Are you sure you want to delete this origin?")) return;
    const result = await deleteShippingOrigin(id);
    if (result.success) {
      toast.success("Origin deleted");
      loadOrigins();
    } else {
      toast.error(result.error || "Failed to delete origin");
    }
  };

  const handleSetDefault = async (id: string) => {
    const result = await setDefaultOrigin(id);
    if (result.success) {
      toast.success("Default origin updated");
      loadOrigins();
    } else {
      toast.error(result.error || "Failed to set default origin");
    }
  };

  const handleSaveOrigin = async () => {
    if (!selectedDestination) {
      toast.error("Please select a destination from the search results");
      return;
    }
    const payload = {
      cityId: selectedDestination.id,
      cityName: selectedDestination.label,
      provinceName: selectedDestination.province_name,
      isDefault: modalIsDefault,
      isActive: modalIsActive,
    };
    const result = editingOrigin
      ? await updateShippingOrigin(editingOrigin.id, payload)
      : await addShippingOrigin(payload);

    if (result.success) {
      toast.success(editingOrigin ? "Origin updated" : "Origin added");
      setShowModal(false);
      loadOrigins();
    } else {
      toast.error(result.error || "Failed to save origin");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div className="flex items-center gap-3">
        <Link href="/admin/store-settings" className="text-body hover:text-blue duration-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Courier Settings</h1>
          <p className="text-custom-sm text-body">Configure Raja Ongkir shipping integration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
          <h2 className="text-lg font-semibold text-dark mb-5">Raja Ongkir Configuration</h2>
          <PasswordInput
            id="apiKey"
            label="API Key"
            value={formData.apiKey}
            onChange={(value) => setFormData({ ...formData, apiKey: value })}
            placeholder="Enter your Raja Ongkir API key"
            required
            error={errors.apiKey}
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
          <h2 className="text-lg font-semibold text-dark mb-4">Test Connection</h2>
          <p className="text-custom-sm text-body mb-4">
            Verify your Raja Ongkir API key before saving.
          </p>
          <TestConnectionButton onTest={handleTestConnection} />
          {testWarning && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Connection test failed, but you can still save these settings.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/store-settings"
            className="font-medium text-body bg-gray-2 py-3 px-6 rounded-lg ease-out duration-200 hover:bg-gray-3"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Shipping Origins */}
      <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-dark">Shipping Origins</h2>
          <button
            type="button"
            onClick={handleAddOrigin}
            className="font-medium text-white bg-blue py-2 px-4 rounded-lg ease-out duration-200 hover:bg-blue-dark flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add New Origin
          </button>
        </div>

        {origins.length === 0 ? (
          <div className="text-center py-8 text-body">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>No shipping origins configured</p>
            <p className="text-custom-sm mt-1">Add at least one origin to calculate shipping costs</p>
          </div>
        ) : (
          <div className="space-y-3">
            {origins.map((origin) => (
              <div key={origin.id} className="p-4 border border-gray-3 rounded-lg hover:border-blue/20 duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark text-sm leading-snug">{origin.cityName}</p>
                    <p className="text-custom-sm text-body">{origin.provinceName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {origin.isDefault ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Default</span>
                    ) : (
                      <button onClick={() => handleSetDefault(origin.id)} className="text-blue hover:text-blue-dark text-sm">
                        Set default
                      </button>
                    )}
                    {origin.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Inactive</span>
                    )}
                    <button onClick={() => handleEditOrigin(origin)} className="text-blue hover:text-blue-dark text-sm">Edit</button>
                    <button onClick={() => handleDeleteOrigin(origin.id)} className="text-red hover:text-red-dark text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-dark mb-4">
                {editingOrigin ? "Edit Origin" : "Add New Origin"}
              </h3>

              <div className="space-y-4">
                {/* Search input */}
                <div ref={dropdownRef} className="relative">
                  <label className="block text-custom-sm font-medium text-dark mb-2">
                    Search Destination <span className="text-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => searchResults.length > 0 && setShowResults(true)}
                      className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 pl-5 pr-10 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      placeholder="Ketik nama kecamatan, kota, atau provinsi..."
                    />
                    {searching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="animate-spin h-4 w-4 text-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    )}
                    {selectedDestination && !searching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-body mt-1">Minimal 3 karakter untuk mencari</p>

                  {/* Results dropdown */}
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-3 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                      {searchResults.map((dest) => (
                        <button
                          key={dest.id}
                          type="button"
                          onClick={() => handleSelectDestination(dest)}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-1 duration-150 border-b border-gray-2 last:border-b-0"
                        >
                          <p className="text-sm text-dark font-medium leading-snug">{dest.subdistrict_name}, {dest.district_name}</p>
                          <p className="text-xs text-body">{dest.city_name}, {dest.province_name} {dest.zip_code}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {showResults && !searching && searchQuery.length >= 3 && searchResults.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-3 rounded-lg shadow-lg px-4 py-3">
                      <p className="text-sm text-body">Tidak ada hasil ditemukan</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalIsDefault}
                      onChange={(e) => setModalIsDefault(e.target.checked)}
                      className="w-4 h-4 text-blue focus:ring-blue"
                    />
                    <span className="text-custom-sm text-dark">Set as default origin</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalIsActive}
                      onChange={(e) => setModalIsActive(e.target.checked)}
                      className="w-4 h-4 text-blue focus:ring-blue"
                    />
                    <span className="text-custom-sm text-dark">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="font-medium text-body bg-gray-2 py-2 px-4 rounded-lg ease-out duration-200 hover:bg-gray-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrigin}
                  disabled={!selectedDestination}
                  className="font-medium text-white bg-blue py-2 px-4 rounded-lg ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingOrigin ? "Update Origin" : "Save Origin"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
