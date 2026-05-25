"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/Admin/PasswordInput";
import TestConnectionButton from "@/components/Admin/TestConnectionButton";
import {
  getPaymentSettings,
  savePaymentSettings,
  testMidtransConnection,
} from "@/app/actions/store-settings";
import type { PaymentSettings, BankAccount } from "@/types/store-settings";
import toast from "react-hot-toast";

const defaultFormData: PaymentSettings = {
  bankTransferEnabled: false,
  bankAccounts: [],
  midtransEnabled: false,
  serverKey: "",
  clientKey: "",
  merchantId: "",
  isProduction: false,
  codEnabled: false,
};

const inputClass =
  "w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";
const labelClass = "block text-custom-sm font-medium text-dark mb-2";

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-dark">{label}</p>
        {description && <p className="text-xs text-body mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-blue" : "bg-gray-3"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function PaymentSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PaymentSettings>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [testWarning, setTestWarning] = useState(false);
  const [newBank, setNewBank] = useState<Omit<BankAccount, "id">>({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });
  const [addingBank, setAddingBank] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getPaymentSettings();
      if (settings) {
        setFormData({ ...defaultFormData, ...settings });
      }
    } catch {
      toast.error("Failed to load payment settings");
    } finally {
      setLoading(false);
    }
  };

  const validateMidtrans = () => {
    const newErrors: Record<string, string> = {};
    if (formData.midtransEnabled) {
      if (!formData.serverKey || formData.serverKey.length < 20)
        newErrors.serverKey = "Server key is required (min 20 characters)";
      if (!formData.clientKey || formData.clientKey.length < 20)
        newErrors.clientKey = "Client key is required (min 20 characters)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateMidtrans()) {
      toast.error("Please fix validation errors first");
      return { success: false, message: "Validation failed" };
    }
    const result = await testMidtransConnection(
      formData.serverKey,
      formData.clientKey,
      formData.isProduction
    );
    setTestWarning(!result.success);
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMidtrans()) {
      toast.error("Please fix validation errors");
      return;
    }
    if (testWarning) {
      const ok = window.confirm(
        "Midtrans connection test failed. Are you sure you want to save?"
      );
      if (!ok) return;
    }
    setSaving(true);
    try {
      const result = await savePaymentSettings(formData);
      if (result.success) {
        toast.success("Payment settings saved!");
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

  const addBankAccount = () => {
    if (!newBank.bankName || !newBank.accountNumber || !newBank.accountHolder) {
      toast.error("Please fill all bank account fields");
      return;
    }
    const account: BankAccount = { id: crypto.randomUUID(), ...newBank };
    setFormData((prev) => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, account],
    }));
    setNewBank({ bankName: "", accountNumber: "", accountHolder: "" });
    setAddingBank(false);
  };

  const removeBankAccount = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter((b) => b.id !== id),
    }));
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
          <h1 className="text-heading-5 font-bold text-dark">Payment Settings</h1>
          <p className="text-custom-sm text-body">Configure payment methods available at checkout.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Bank Transfer ── */}
        <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2 space-y-5">
          <Toggle
            checked={formData.bankTransferEnabled}
            onChange={(v) => setFormData({ ...formData, bankTransferEnabled: v })}
            label="Bank Transfer"
            description="Customers pay via manual bank transfer, then upload proof of payment."
          />

          {formData.bankTransferEnabled && (
            <div className="space-y-4 pt-2 border-t border-gray-2">
              <div className="flex items-center justify-between">
                <p className="text-custom-sm font-medium text-dark">Bank Accounts</p>
                {!addingBank && (
                  <button
                    type="button"
                    onClick={() => setAddingBank(true)}
                    className="text-custom-sm text-blue hover:text-blue-dark font-medium flex items-center gap-1"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Account
                  </button>
                )}
              </div>

              {/* Existing accounts */}
              {formData.bankAccounts.length > 0 && (
                <div className="space-y-2">
                  {formData.bankAccounts.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between bg-gray-1 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-dark">{acc.bankName}</p>
                        <p className="text-xs text-body">{acc.accountNumber} · {acc.accountHolder}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBankAccount(acc.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add account form */}
              {addingBank && (
                <div className="border border-gray-3 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Bank Name</label>
                      <input
                        type="text"
                        value={newBank.bankName}
                        onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                        className={inputClass}
                        placeholder="BCA"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Account Number</label>
                      <input
                        type="text"
                        value={newBank.accountNumber}
                        onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                        className={inputClass}
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Account Holder</label>
                      <input
                        type="text"
                        value={newBank.accountHolder}
                        onChange={(e) => setNewBank({ ...newBank, accountHolder: e.target.value })}
                        className={inputClass}
                        placeholder="PT Simbiospace"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addBankAccount}
                      className="text-custom-sm font-medium text-white bg-blue py-2 px-4 rounded-lg hover:bg-blue-dark duration-200"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddingBank(false); setNewBank({ bankName: "", accountNumber: "", accountHolder: "" }); }}
                      className="text-custom-sm font-medium text-body bg-gray-2 py-2 px-4 rounded-lg hover:bg-gray-3 duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {formData.bankAccounts.length === 0 && !addingBank && (
                <p className="text-custom-sm text-body text-center py-3">No bank accounts added yet.</p>
              )}
            </div>
          )}
        </div>

        {/* ── Midtrans ── */}
        <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2 space-y-5">
          <Toggle
            checked={formData.midtransEnabled}
            onChange={(v) => setFormData({ ...formData, midtransEnabled: v })}
            label="Midtrans"
            description="Accept credit cards, e-wallets, virtual accounts, and more via Midtrans."
          />

          {formData.midtransEnabled && (
            <div className="space-y-5 pt-2 border-t border-gray-2">
              <PasswordInput
                id="serverKey"
                label="Server Key"
                value={formData.serverKey}
                onChange={(value) => setFormData({ ...formData, serverKey: value })}
                placeholder="SB-Mid-server-xxxxxxxxxxxxxxxx"
                required
                error={errors.serverKey}
              />

              <PasswordInput
                id="clientKey"
                label="Client Key"
                value={formData.clientKey}
                onChange={(value) => setFormData({ ...formData, clientKey: value })}
                placeholder="SB-Mid-client-xxxxxxxxxxxxxxxx"
                required
                error={errors.clientKey}
              />

              <div>
                <label htmlFor="merchantId" className={labelClass}>Merchant ID (Optional)</label>
                <input
                  type="text"
                  id="merchantId"
                  value={formData.merchantId}
                  onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
                  className={inputClass}
                  placeholder="G123456789"
                />
              </div>

              <div>
                <label className={labelClass}>Environment</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="environment"
                      checked={!formData.isProduction}
                      onChange={() => setFormData({ ...formData, isProduction: false })}
                      className="w-4 h-4 text-blue focus:ring-blue"
                    />
                    <span className="text-custom-sm text-dark">Sandbox</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="environment"
                      checked={formData.isProduction}
                      onChange={() => setFormData({ ...formData, isProduction: true })}
                      className="w-4 h-4 text-blue focus:ring-blue"
                    />
                    <span className="text-custom-sm text-dark">Production</span>
                  </label>
                </div>
                {formData.isProduction && (
                  <p className="mt-2 text-custom-xs text-yellow-600 flex items-start gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Production mode will process real transactions. Test thoroughly in Sandbox first.
                  </p>
                )}
              </div>

              <div>
                <p className="text-custom-sm font-medium text-dark mb-3">Test Connection</p>
                <TestConnectionButton onTest={handleTestConnection} />
                {testWarning && (
                  <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Connection test failed. Verify your credentials before going live.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Cash on Delivery ── */}
        <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
          <Toggle
            checked={formData.codEnabled}
            onChange={(v) => setFormData({ ...formData, codEnabled: v })}
            label="Cash on Delivery (CoD)"
            description="Customers pay in cash when the order is delivered."
          />
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
            className="font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
