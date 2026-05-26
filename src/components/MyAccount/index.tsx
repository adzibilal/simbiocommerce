"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { formatCurrency } from "@/lib/currency";
import { updateUserProfile } from "@/app/actions/user";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  image: string | null;
};

type OrderRow = {
  id: string;
  date: string | null;
  total: number;
  status: string | null;
  courierCode: string | null;
  courierService: string | null;
  trackingNumber: string | null;
  shippingStatus: string | null;
  paymentStatus: string | null;
};

interface Props {
  user: UserRow;
  orders: OrderRow[];
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue/10 text-blue",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red/10 text-red",
  paid: "bg-green-100 text-green-700",
};

const StatusBadge = ({ status }: { status: string | null }) => {
  const color = statusColor[status || ""];
  return (
    <span
      style={
        status === "paid"
          ? { backgroundColor: "#dcfce7", color: "#15803d" }
          : status === "pending"
          ? { backgroundColor: "#fef9c3", color: "#a16207" }
          : status === "failed" || status === "cancelled"
          ? { backgroundColor: "#fee2e2", color: "#dc2626" }
          : undefined
      }
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${color || "bg-gray-2 text-dark-4"}`}
    >
      {status || "—"}
    </span>
  );
};

const TABS = ["Overview", "Orders", "Profile"];

const MyAccount = ({ user, orders }: Props) => {
  const router = useRouter();
  const [tab, setTab] = useState("Overview");
  const [profile, setProfile] = useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    await updateUserProfile(user.id, { name: profile.name, phone: profile.phone, address: profile.address });
    setSaving(false);
    setSaveMsg("Profile updated successfully!");
    router.refresh();
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const inputClass = "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

  return (
    <>
      <Breadcrumb title="My Account" pages={["my account"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">

            {/* Sidebar */}
            <div className="xl:w-[280px] shrink-0 bg-white rounded-xl shadow-1">
              {/* User info */}
              <div className="flex items-center gap-4 p-6 border-b border-gray-3">
                <div className="w-12 h-12 rounded-full bg-blue/10 flex items-center justify-center shrink-0">
                  <span className="text-blue font-semibold text-lg">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-dark truncate">{user.name || "Customer"}</p>
                  <p className="text-xs text-dark-4 truncate">{user.email}</p>
                </div>
              </div>

              {/* Nav */}
              <nav className="p-4 flex flex-row xl:flex-col gap-2">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex items-center gap-2.5 py-2.5 px-4 rounded-lg text-sm font-medium ease-out duration-200 ${
                      tab === t ? "bg-blue text-white" : "text-dark-2 hover:bg-blue/5 hover:text-blue"
                    }`}
                  >
                    {t === "Overview" && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                      </svg>
                    )}
                    {t === "Orders" && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 01-8 0" />
                      </svg>
                    )}
                    {t === "Profile" && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                    {t}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">

              {/* Overview tab */}
              {tab === "Overview" && (
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Total Orders", value: orders.length },
                      { label: "Delivered", value: orders.filter(o => o.status === "delivered").length },
                      { label: "Pending", value: orders.filter(o => o.status === "pending").length },
                    ].map((s) => (
                      <div key={s.label} className="bg-white rounded-xl shadow-1 p-5">
                        <p className="text-2xl font-bold text-dark">{s.value}</p>
                        <p className="text-sm text-dark-4 mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent orders */}
                  <div className="bg-white rounded-xl shadow-1">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-3">
                      <h3 className="font-medium text-dark">Recent Orders</h3>
                      <button onClick={() => setTab("Orders")} className="text-sm text-blue hover:underline">View all</button>
                    </div>
                    {orders.length === 0 ? (
                      <p className="text-dark-4 text-sm p-6">No orders yet.</p>
                    ) : (
                      <div className="divide-y divide-gray-3">
                        {orders.slice(0, 5).map((o) => (
                          <div key={o.id} className="flex items-center justify-between px-6 py-4 gap-4">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-dark truncate">#{o.id.slice(0, 8).toUpperCase()}</p>
                              <p className="text-xs text-dark-4">{o.date ? new Date(o.date).toLocaleDateString("id-ID") : "—"}</p>
                            </div>
                            <StatusBadge status={o.status} />
                            <p className="text-sm font-medium text-dark shrink-0">{formatCurrency(o.total)}</p>
                            <Link href={`/order-success?orderId=${o.id}`} className="text-blue hover:text-blue-dark text-xs font-medium shrink-0">
                              Detail
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Orders tab */}
              {tab === "Orders" && (
                <div className="bg-white rounded-xl shadow-1">
                  <div className="px-6 py-4 border-b border-gray-3">
                    <h3 className="font-medium text-dark">My Orders</h3>
                  </div>
                  {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-dark-4">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-40">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
                      </svg>
                      <p className="text-sm">You don&apos;t have any orders yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-3 bg-gray-1 text-left">
                            <th className="py-3 px-5 font-medium text-dark-2">Order ID</th>
                            <th className="py-3 px-5 font-medium text-dark-2">Date</th>
                            <th className="py-3 px-5 font-medium text-dark-2">Total</th>
                            <th className="py-3 px-5 font-medium text-dark-2">Order Status</th>
                            <th className="py-3 px-5 font-medium text-dark-2">Payment</th>
                            <th className="py-3 px-5 font-medium text-dark-2">Courier</th>
                            <th className="py-3 px-5 font-medium text-dark-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((o) => (
                            <tr key={o.id} className="border-b border-gray-3 last:border-0 hover:bg-gray-1/50">
                              <td className="py-3 px-5 font-medium text-dark">#{o.id.slice(0, 8).toUpperCase()}</td>
                              <td className="py-3 px-5 text-dark-4">{o.date ? new Date(o.date).toLocaleDateString("id-ID") : "—"}</td>
                              <td className="py-3 px-5 font-medium text-dark">{formatCurrency(o.total)}</td>
                              <td className="py-3 px-5"><StatusBadge status={o.status} /></td>
                              <td className="py-3 px-5"><StatusBadge status={o.paymentStatus} /></td>
                              <td className="py-3 px-5 text-dark-4">
                                {o.courierCode ? `${o.courierCode} ${o.courierService}` : "—"}
                                {o.trackingNumber && <p className="text-xs text-blue">{o.trackingNumber}</p>}
                              </td>
                              <td className="py-3 px-5">
                                <Link href={`/order-success?orderId=${o.id}`} className="text-blue hover:text-blue-dark text-xs font-medium whitespace-nowrap">
                                  Lihat Detail
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Profile tab */}
              {tab === "Profile" && (
                <div className="bg-white rounded-xl shadow-1">
                  <div className="px-6 py-4 border-b border-gray-3">
                    <h3 className="font-medium text-dark">Edit Profile</h3>
                  </div>
                  <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                        placeholder="Your name"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">Email</label>
                      <input type="email" value={user.email} disabled className={inputClass + " opacity-50 cursor-not-allowed"} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                        placeholder="08xxxxxxxxxx"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">Address</label>
                      <input
                        type="text"
                        value={profile.address}
                        onChange={(e) => setProfile(p => ({ ...p, address: e.target.value }))}
                        placeholder="Your street address"
                        className={inputClass}
                      />
                    </div>

                    {saveMsg && (
                      <p className="text-sm text-green-600">{saveMsg}</p>
                    )}

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex font-medium text-white bg-blue py-2.5 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MyAccount;
