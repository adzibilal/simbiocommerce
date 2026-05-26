"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getEmailSettings, saveEmailSettings } from "@/app/actions/store-settings";
import type { EmailSettings } from "@/app/actions/store-settings";

const inputClass = "w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 text-sm";
const labelClass = "block text-custom-sm font-medium text-dark mb-2";

export default function EmailSettingsPage() {
  const [form, setForm] = useState<EmailSettings>({
    resendApiKey: "",
    fromEmail: "",
    fromName: "",
    enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    getEmailSettings().then((s) => {
      if (s) setForm(s);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.resendApiKey || !form.fromEmail || !form.fromName) {
      toast.error("Semua field wajib diisi");
      return;
    }
    setSaving(true);
    const res = await saveEmailSettings(form);
    setSaving(false);
    if (res.success) toast.success("Email settings berhasil disimpan!");
    else toast.error(res.error ?? "Gagal menyimpan");
  };

  const handleTest = async () => {
    if (!form.resendApiKey || !form.fromEmail) {
      toast.error("Simpan settings terlebih dahulu");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: form.fromEmail }),
      });
      const data = await res.json();
      if (data.success) toast.success("Test email berhasil dikirim! Cek inbox kamu.");
      else toast.error(data.error ?? "Gagal kirim test email");
    } catch {
      toast.error("Gagal kirim test email");
    } finally {
      setTesting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin w-8 h-8 border-2 border-blue border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6 font-euclid-circular-a max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/store-settings" className="text-body hover:text-blue duration-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Email Settings</h1>
          <p className="text-custom-sm text-body">Konfigurasi Resend untuk kirim notifikasi email otomatis.</p>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue/5 border border-blue/20 rounded-xl p-4 text-sm text-dark space-y-1">
        <p className="font-semibold text-blue">Email dikirim otomatis untuk:</p>
        <ul className="list-disc list-inside text-body space-y-0.5 mt-1">
          <li>Konfirmasi pesanan ke customer</li>
          <li>Notifikasi pesanan baru ke admin</li>
          <li>Update status pesanan (shipped, delivered, cancelled)</li>
          <li>Notifikasi bukti transfer ke admin</li>
        </ul>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-1 border border-gray-2 p-6 space-y-5">

        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-dark text-sm">Aktifkan Email Notifications</p>
            <p className="text-xs text-body mt-0.5">Jika dimatikan, tidak ada email yang akan dikirim.</p>
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${form.enabled ? "bg-blue" : "bg-gray-3"}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${form.enabled ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        <hr className="border-gray-2" />

        {/* Resend API Key */}
        <div>
          <label className={labelClass}>Resend API Key *</label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={form.resendApiKey}
              onChange={(e) => setForm((f) => ({ ...f, resendApiKey: e.target.value }))}
              placeholder="re_xxxxxxxxxxxxxxxxxxxx"
              className={inputClass + " pr-12"}
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-body hover:text-dark"
            >
              {showKey ? (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-body mt-1">Dapatkan API key di <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">resend.com/api-keys</a></p>
        </div>

        {/* From Email */}
        <div>
          <label className={labelClass}>From Email *</label>
          <input
            type="email"
            value={form.fromEmail}
            onChange={(e) => setForm((f) => ({ ...f, fromEmail: e.target.value }))}
            placeholder="noreply@tokokamu.com"
            className={inputClass}
          />
          <p className="text-xs text-body mt-1">Harus menggunakan domain yang sudah diverifikasi di Resend. Untuk testing bisa pakai <code className="bg-gray-1 px-1 rounded">onboarding@resend.dev</code></p>
        </div>

        {/* From Name */}
        <div>
          <label className={labelClass}>From Name *</label>
          <input
            type="text"
            value={form.fromName}
            onChange={(e) => setForm((f) => ({ ...f, fromName: e.target.value }))}
            placeholder="Nama Toko"
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue text-white font-medium rounded-lg hover:bg-blue-dark duration-200 disabled:opacity-50 text-sm"
          >
            {saving ? "Menyimpan..." : "Simpan Settings"}
          </button>
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !form.resendApiKey}
            className="px-6 py-2.5 bg-gray-2 text-dark font-medium rounded-lg hover:bg-gray-3 duration-200 disabled:opacity-50 text-sm"
          >
            {testing ? "Mengirim..." : "Kirim Test Email"}
          </button>
        </div>
      </form>
    </div>
  );
}
