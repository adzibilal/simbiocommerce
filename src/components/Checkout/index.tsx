"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Breadcrumb from "../Common/Breadcrumb";
import Billing, { BillingData } from "./Billing";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import Coupon from "./Coupon";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { formatCurrency } from "@/lib/currency";
import { selectCartItems, selectTotalPrice, selectTotalWeight, removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { createOrder } from "@/app/actions/order";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DomesticDestination } from "@/app/actions/shipping";
import type { PaymentSettings } from "@/types/store-settings";

declare global {
  interface Window {
    snap: any;
  }
}

type SavedAddress = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  provinceId: number | null;
  cityId: number | null;
  postalCode: string | null;
  isDefault: boolean | null;
};

type Props = {
  paymentSettings: PaymentSettings | null;
  originCityId: number | null;
  userProfile?: { name?: string | null; email?: string | null; phone?: string | null; address?: string | null } | null;
  savedAddresses?: SavedAddress[];
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${copied ? "bg-green-100 text-green-700" : "bg-white border border-gray-3 text-dark-4 hover:text-blue hover:border-blue"}`}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
          Copy
        </>
      )}
    </button>
  );
}

const Checkout = ({ paymentSettings, originCityId, userProfile, savedAddresses = [] }: Props) => {
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const totalPrice = useAppSelector(selectTotalPrice);
  const totalWeight = useAppSelector(selectTotalWeight);

  const [billing, setBilling] = useState<BillingData>({
    name: userProfile?.name || "",
    phone: userProfile?.phone || "",
    email: userProfile?.email || "",
    address: userProfile?.address || "",
  });
  const [destination, setDestination] = useState<DomesticDestination | null>(null);
  const [shippingOption, setShippingOption] = useState<{ cost: number; courier: string; service: string } | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Available payment methods based on settings
  const availableMethods = [
    paymentSettings?.midtransEnabled && { id: "midtrans", label: "Midtrans", description: "Kartu kredit, e-wallet, virtual account" },
    paymentSettings?.bankTransferEnabled && { id: "bank_transfer", label: "Transfer Bank", description: "Transfer manual ke rekening kami" },
    paymentSettings?.codEnabled && { id: "cod", label: "Cash on Delivery (COD)", description: "Bayar saat paket tiba" },
  ].filter(Boolean) as { id: string; label: string; description: string }[];

  // Auto-select first available method
  useEffect(() => {
    if (availableMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(availableMethods[0].id);
    }
  }, []);

  useEffect(() => {
    if (!paymentSettings?.midtransEnabled) return;
    const midtransScriptUrl =
      paymentSettings.isProduction
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";

    const script = document.createElement("script");
    script.src = midtransScriptUrl;
    script.setAttribute("data-client-key", paymentSettings.clientKey || "");
    script.onload = () => setSnapLoaded(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [paymentSettings]);

  const shippingCost = shippingOption?.cost ?? 0;
  const grandTotal = totalPrice - couponDiscount + shippingCost;

  const validate = () => {
    if (cartItems.length === 0) { setError("Keranjang belanja kosong"); return false; }
    if (!billing.name || !billing.email || !billing.phone || !billing.address) { setError("Lengkapi data diri terlebih dahulu"); return false; }
    if (!destination) { setError("Pilih tujuan pengiriman terlebih dahulu"); return false; }
    if (!shippingOption) { setError("Pilih metode pengiriman terlebih dahulu"); return false; }
    if (!paymentMethod) { setError("Pilih metode pembayaran terlebih dahulu"); return false; }
    if (paymentMethod === "midtrans" && !snapLoaded) { setError("Sistem pembayaran sedang dimuat, coba lagi..."); return false; }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (paymentMethod === "cod" || paymentMethod === "bank_transfer") {
      setShowConfirm(true);
      return;
    }
    await placeOrder();
  };

  const placeOrder = async () => {
    setIsSubmitting(true);
    setError(null);
    setShowConfirm(false);

    try {
      const nameParts = billing.name.trim().split(" ");
      const firstName = nameParts[0] || "Customer";
      const lastName = nameParts.slice(1).join(" ") || "";

      const result = await createOrder({
        userId: session?.user?.id ?? undefined,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          weight: item.weight,
        })),
        shippingData: {
          destinationCityId: destination!.id,
          courierCode: shippingOption!.courier,
          courierService: shippingOption!.service,
          shippingCost: shippingOption!.cost,
          totalWeight,
        },
        paymentData: {
          paymentMethod,
          paymentAmount: grandTotal,
        },
        customerDetails: {
          firstName,
          lastName,
          email: billing.email,
          phone: billing.phone,
        },
        shippingAddress: `${billing.address}, ${destination!.subdistrict_name}, ${destination!.district_name}, ${destination!.city_name}, ${destination!.province_name} ${destination!.zip_code}`,
        notes,
        couponDiscount,
      });

      if (!result.success) {
        setError(result.error || "Gagal membuat pesanan");
        setIsSubmitting(false);
        return;
      }

      if (paymentMethod === "midtrans" && result.paymentToken) {
        window.snap.pay(result.paymentToken, {
          onSuccess: (r: any) => { dispatch(removeAllItemsFromCart()); router.push(`/order-success?orderId=${r.order_id}`); },
          onPending: (r: any) => { dispatch(removeAllItemsFromCart()); router.push(`/order-success?orderId=${r.order_id}&status=pending`); },
          onError: () => { setError("Pembayaran gagal. Silakan coba lagi."); setIsSubmitting(false); },
          onClose: () => setIsSubmitting(false),
        });
      } else {
        const orderId = (result as any).orderId as string;
        dispatch(removeAllItemsFromCart());
        router.push(`/order-success?orderId=${orderId}`);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">

              {/* Left column */}
              <div className="lg:max-w-[670px] w-full">
                {!session && (
                  <div className="bg-blue/5 border border-blue/20 rounded-[10px] p-4 mb-7.5 text-sm text-dark-4 flex items-center justify-between gap-4">
                    <span>Sudah punya akun? Login untuk mengisi data otomatis.</span>
                    <a href={`/signin?callbackUrl=/checkout`} className="shrink-0 text-blue font-medium hover:underline">Login</a>
                  </div>
                )}

                {/* Saved address selector */}
                {savedAddresses.length > 0 && (
                  <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mb-7.5">
                    <h3 className="font-medium text-dark mb-3">Alamat Tersimpan</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => setBilling((prev) => ({
                            ...prev,
                            name: addr.recipientName,
                            phone: addr.phone,
                            address: addr.address,
                          }))}
                          className="text-left p-3 rounded-xl border-2 border-gray-3 hover:border-blue transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold bg-blue/10 text-blue px-2 py-0.5 rounded-full">{addr.label}</span>
                            {addr.isDefault && <span className="text-xs text-green font-medium">Default</span>}
                          </div>
                          <p className="text-sm font-medium text-dark">{addr.recipientName}</p>
                          <p className="text-xs text-dark-4 truncate">{addr.address}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Billing */}
                <Billing data={billing} onChange={setBilling} />

                {/* Destination + Shipping Method */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <h3 className="font-medium text-xl text-dark mb-5">Tujuan Pengiriman</h3>
                  <Shipping selected={destination} onSelect={(d) => { setDestination(d); setShippingOption(null); }} />
                  {originCityId && (
                    <ShippingMethod
                      originCity={originCityId}
                      destinationCity={destination?.id}
                      weight={totalWeight}
                      onShippingSelect={(cost, courier, service) => setShippingOption({ cost, courier, service })}
                    />
                  )}
                </div>

                {/* Payment Method */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <h3 className="font-medium text-xl text-dark mb-5">Metode Pembayaran</h3>
                  {availableMethods.length === 0 ? (
                    <p className="text-sm text-dark-4">Belum ada metode pembayaran yang aktif. Hubungi admin.</p>
                  ) : (
                    <div className="space-y-3">
                      {availableMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                            paymentMethod === method.id
                              ? "border-blue bg-blue/5"
                              : "border-gray-3 hover:border-gray-4"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id)}
                            className="mt-1 accent-blue"
                          />
                          <div>
                            <p className="font-medium text-dark text-sm">{method.label}</p>
                            <p className="text-xs text-dark-4 mt-0.5">{method.description}</p>
                          </div>
                        </label>
                      ))}

                      {/* Bank accounts info */}
                      {paymentMethod === "bank_transfer" && paymentSettings?.bankAccounts && paymentSettings.bankAccounts.length > 0 && (
                        <div className="mt-3 p-4 bg-gray-1 rounded-xl border border-gray-3 space-y-3">
                          <p className="text-sm font-medium text-dark">Rekening Tujuan Transfer:</p>
                          {paymentSettings.bankAccounts.map((acc) => (
                            <div key={acc.id} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center shrink-0">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue">
                                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-dark">{acc.bankName}</p>
                                <p className="text-xs text-dark-4">{acc.accountNumber} · {acc.accountHolder}</p>
                              </div>
                            </div>
                          ))}
                          <p className="text-xs text-dark-4">Setelah transfer, admin akan memverifikasi pembayaran Anda.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <label htmlFor="notes" className="block mb-2.5 font-medium text-dark">
                    Catatan Pesanan <span className="text-dark-4 font-normal text-sm">(opsional)</span>
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan khusus untuk pesanan Anda..."
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              {/* Right column */}
              <div className="max-w-[455px] w-full">

                {/* Order summary */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Pesanan Anda</h3>
                  </div>
                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    <div className="flex items-center justify-between py-4 border-b border-gray-3">
                      <h4 className="font-medium text-dark">Produk</h4>
                      <h4 className="font-medium text-dark">Subtotal</h4>
                    </div>

                    {cartItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 py-4 border-b border-gray-3">
                        <div className="shrink-0 w-12 h-12 rounded-md overflow-hidden bg-gray-2 border border-gray-3">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-2" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-dark text-sm truncate">{item.name}</p>
                          <p className="text-dark-4 text-xs">x{item.quantity}</p>
                        </div>
                        <p className="text-dark text-sm shrink-0">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}

                    {couponDiscount > 0 && (
                      <div className="flex items-center justify-between py-4 border-b border-gray-3">
                        <p className="text-green-600 text-sm">Kupon ({couponCode})</p>
                        <p className="text-green-600 text-sm">- {formatCurrency(couponDiscount)}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-4 border-b border-gray-3">
                      <p className="text-dark">Ongkos Kirim</p>
                      <p className="text-dark">
                        {shippingOption
                          ? formatCurrency(shippingOption.cost)
                          : <span className="text-dark-4 text-sm">Pilih metode di bawah</span>}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-5">
                      <p className="font-medium text-lg text-dark">Total</p>
                      <p className="font-medium text-lg text-dark">
                        {shippingOption ? formatCurrency(grandTotal) : formatCurrency(totalPrice - couponDiscount)}
                      </p>
                    </div>

                    {error && (
                      <div className="mt-4 p-3 bg-red-50 text-red text-sm rounded-lg">{error}</div>
                    )}
                  </div>
                </div>

                {/* Coupon */}
                <Coupon
                  subtotal={totalPrice}
                  appliedCode={couponCode}
                  onApply={(discount, code) => { setCouponDiscount(discount); setCouponCode(code); }}
                />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0 || availableMethods.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Memproses..." : "Proses Checkout"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Confirmation modal for COD / Bank Transfer */}
      {showConfirm && (
        <div className="fixed inset-0 z-99999 bg-dark/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden">
            {paymentMethod === "bank_transfer" ? (
              <>
                <div className="px-6 pt-6 pb-4 border-b border-gray-2">
                  <h3 className="font-bold text-lg text-dark">Konfirmasi Transfer Bank</h3>
                  <p className="text-sm text-dark-4 mt-1">Silakan transfer ke salah satu rekening berikut</p>
                </div>
                <div className="px-6 py-4 space-y-3">
                  {paymentSettings?.bankAccounts?.map((acc) => (
                    <div key={acc.id} className="flex items-center gap-3 p-3 bg-gray-1 rounded-xl border border-gray-3">
                      <div className="w-9 h-9 rounded-full bg-blue/10 flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue">
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-dark text-sm">{acc.bankName}</p>
                        <p className="text-dark-4 text-xs">{acc.accountNumber} · {acc.accountHolder}</p>
                      </div>
                      <CopyButton text={acc.accountNumber} />
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-2">
                    <span className="text-sm text-dark-4">Total yang harus ditransfer</span>
                    <span className="font-bold text-dark text-lg">{formatCurrency(grandTotal)}</span>
                  </div>
                  <p className="text-xs text-dark-4 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                    ⚠️ Pesanan akan diproses setelah admin mengkonfirmasi pembayaran kamu.
                  </p>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                  <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-xl border border-gray-3 text-dark font-medium hover:bg-gray-1 transition-colors text-sm">
                    Batal
                  </button>
                  <button onClick={placeOrder} disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-blue text-white font-medium hover:bg-blue-dark transition-colors text-sm disabled:opacity-50">
                    {isSubmitting ? "Memproses..." : "Buat Pesanan"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="px-6 pt-6 pb-4">
                  <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg text-dark text-center">Konfirmasi Cash on Delivery</h3>
                  <p className="text-sm text-dark-4 text-center mt-2">
                    Kamu akan membayar <span className="font-bold text-dark">{formatCurrency(grandTotal)}</span> secara tunai saat paket tiba di tujuan.
                  </p>
                  <p className="text-xs text-dark-4 text-center mt-3">Pastikan ada orang yang bisa menerima paket dan membayar.</p>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                  <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-xl border border-gray-3 text-dark font-medium hover:bg-gray-1 transition-colors text-sm">
                    Batal
                  </button>
                  <button onClick={placeOrder} disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-blue text-white font-medium hover:bg-blue-dark transition-colors text-sm disabled:opacity-50">
                    {isSubmitting ? "Memproses..." : "Konfirmasi Pesanan"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;
