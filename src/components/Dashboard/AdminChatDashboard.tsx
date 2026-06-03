"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  getAdminChatSessions,
  getChatMessages,
  sendChatMessage,
  markChatAsRead,
  toggleAiForSession,
} from "@/app/actions/chat";
import Pusher from "pusher-js";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/currency";
import {
  getNotificationPermission,
  requestNotificationPermission,
  showBrowserNotification,
} from "@/lib/notifications";

interface ChatSession {
  customerId: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  aiEnabled: boolean;
}

interface Message {
  id: string;
  customerId: string;
  senderId: string | null;
  senderType: "customer" | "admin";
  message: string;
  messageType: string;
  isAiReply: boolean;
  isRead: boolean;
  createdAt: string;
}

interface ProductCardData {
  type: "product_card";
  text: string;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    slug: string;
    imageUrl: string | null;
  };
}

interface OrderSummary {
  id: string;
  orderStatus: string | null;
  orderDate: string | null;
  grandTotal: number;
  totalShippingCost: number;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
}

interface OrderInfoData {
  type: "order_info";
  text: string;
  order: OrderSummary;
}

interface OrderListData {
  type: "order_list";
  text: string;
  orders: OrderSummary[];
}

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Menunggu Bayar", color: "text-orange-600 bg-orange-50" },
  processing: { label: "Diproses", color: "text-blue bg-blue/10" },
  shipped: { label: "Dikirim", color: "text-purple-600 bg-purple-50" },
  delivered: { label: "Terkirim", color: "text-green bg-green/10" },
  cancelled: { label: "Dibatalkan", color: "text-red bg-red/10" },
};

function parseRichMessage(msg: Message): ProductCardData | OrderInfoData | OrderListData | null {
  if (msg.messageType === "text") return null;
  try {
    return JSON.parse(msg.message);
  } catch {
    return null;
  }
}

function AiBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-purple-100 text-purple-600 border border-purple-200 ml-1">
      ✦ AI
    </span>
  );
}

function AdminProductCardBubble({ data }: { data: ProductCardData }) {
  return (
    <div className="space-y-1.5 max-w-[70%]">
      {data.text && (
        <div className="bg-white text-dark border border-gray-2 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs shadow-sm">
          <p className="leading-relaxed break-words">{data.text}</p>
        </div>
      )}
      <a
        href={`/products/${data.product.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white border border-gray-2 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        {data.product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.product.imageUrl} alt={data.product.name} className="w-full h-24 object-cover" />
        )}
        <div className="p-2.5 space-y-0.5">
          <p className="text-xs font-bold text-dark line-clamp-1">{data.product.name}</p>
          <p className="text-sm font-bold text-blue">{formatCurrency(data.product.price)}</p>
          <p className={`text-[10px] font-semibold ${data.product.stock > 0 ? "text-green" : "text-red"}`}>
            {data.product.stock > 0 ? `Stok: ${data.product.stock}` : "Habis"}
          </p>
        </div>
      </a>
    </div>
  );
}

function AdminOrderStatusBadge({ status }: { status: string | null }) {
  const s = ORDER_STATUS_LABELS[status || ""];
  if (!s) return <span className="text-[10px] font-bold text-body">{status || "-"}</span>;
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>;
}

function AdminSingleOrderCard({ order }: { order: OrderSummary }) {
  return (
    <div className="bg-white border border-gray-2 rounded-xl shadow-sm p-2.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-body">ID Pesanan</p>
        <p className="text-[10px] font-bold text-dark font-mono">{order.id.slice(0, 8)}...</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-body">Status</p>
        <AdminOrderStatusBadge status={order.orderStatus} />
      </div>
      {order.items.slice(0, 2).map((item, idx) => (
        <div key={idx} className="flex items-center justify-between border-t border-gray-1 pt-1">
          <p className="text-[10px] text-dark truncate flex-1 mr-2">{item.name} ×{item.quantity}</p>
          <p className="text-[10px] font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</p>
        </div>
      ))}
      {order.items.length > 2 && (
        <p className="text-[9px] text-body border-t border-gray-1 pt-1">+{order.items.length - 2} produk lainnya</p>
      )}
      <div className="flex items-center justify-between border-t border-gray-2 pt-1">
        <p className="text-[10px] font-bold text-dark">Total</p>
        <p className="text-xs font-bold text-blue">{formatCurrency(order.grandTotal)}</p>
      </div>
    </div>
  );
}

function AdminOrderInfoBubble({ data }: { data: OrderInfoData }) {
  return (
    <div className="space-y-1.5 max-w-[70%]">
      {data.text && (
        <div className="bg-white text-dark border border-gray-2 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs shadow-sm">
          <p className="leading-relaxed break-words">{data.text}</p>
        </div>
      )}
      <AdminSingleOrderCard order={data.order} />
    </div>
  );
}

function AdminOrderListBubble({ data }: { data: OrderListData }) {
  return (
    <div className="space-y-1.5 max-w-[70%]">
      {data.text && (
        <div className="bg-white text-dark border border-gray-2 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs shadow-sm">
          <p className="leading-relaxed break-words">{data.text}</p>
        </div>
      )}
      {data.orders.length === 0 ? (
        <div className="bg-white border border-gray-2 rounded-xl p-3 text-center">
          <p className="text-xs text-body">Belum ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-0.5">
          {data.orders.map((order) => (
            <AdminSingleOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminChatDashboard() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [togglingAi, setTogglingAi] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>("default");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const selectedCustomerIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedCustomerIdRef.current = selectedCustomerId;
  }, [selectedCustomerId]);

  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  const requestPermission = () => {
    requestNotificationPermission().then((perm) => setNotificationPermission(perm));
  };

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(880.0, audioCtx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.4);
    } catch (err) {
      console.warn("Gagal memutar suara notifikasi:", err);
    }
  };

  const handleSelectSession = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (getNotificationPermission() === "default") {
      requestNotificationPermission().then((perm) => setNotificationPermission(perm));
    }
  };

  const selectedCustomer = useMemo(() => {
    return sessions.find((s) => s.customerId === selectedCustomerId) || null;
  }, [sessions, selectedCustomerId]);

  const selectedAiEnabled = selectedCustomer?.aiEnabled ?? true;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getAdminChatSessions();
        if (res.success && res.sessions) {
          const sorted = (res.sessions as ChatSession[]).sort(
            (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          );
          setSessions(sorted);
        } else {
          toast.error(res.error || "Gagal memuat sesi chat");
        }
      } catch {
        toast.error("Terjadi kesalahan saat memuat chat");
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!selectedCustomerId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await getChatMessages(selectedCustomerId);
        if (res.success && res.messages) {
          setMessages(res.messages as Message[]);
          setSessions((prev) =>
            prev.map((s) => (s.customerId === selectedCustomerId ? { ...s, unreadCount: 0 } : s))
          );
          await markChatAsRead(selectedCustomerId, "admin");
        } else {
          toast.error(res.error || "Gagal memuat riwayat pesan");
        }
      } catch {
        toast.error("Terjadi kesalahan saat memuat pesan");
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedCustomerId]);

  // Pusher setup — use ref for selectedCustomerId to avoid reconnecting on tab switch
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: "/api/chat/auth",
    });
    pusherRef.current = pusher;

    const channel = pusher.subscribe("private-chat-admin-notifications");

    channel.bind("new-message", (message: Message & { customerName?: string; customerEmail?: string }) => {
      const currentSelected = selectedCustomerIdRef.current;
      const isSelected = message.customerId === currentSelected;
      const isCustomerMsg = message.senderType === "customer";
      const isMyOwnMsg = message.senderId === session?.user?.id;

      if (isSelected && !isMyOwnMsg) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        markChatAsRead(currentSelected!, "admin");
      }

      if (isCustomerMsg && (!isSelected || document.hidden)) {
        playChime();
        const preview = message.message.length > 30 ? message.message.substring(0, 30) + "..." : message.message;
        toast(`Chat dari ${message.customerName || "Pelanggan"}: ${preview}`, { icon: "💬", duration: 4000 });

        if (getNotificationPermission() === "granted") {
          showBrowserNotification(`Chat baru dari ${message.customerName || "Pelanggan"}`, {
            body: message.message,
            tag: `chat-${message.customerId}`,
            url: "/admin/chat",
          });
        }
      }

      setSessions((prevSessions) => {
        const idx = prevSessions.findIndex((s) => s.customerId === message.customerId);
        let updated = [...prevSessions];
        if (idx !== -1) {
          const existing = updated[idx];
          updated[idx] = {
            ...existing,
            lastMessage: message.message,
            lastMessageAt: message.createdAt,
            unreadCount: isCustomerMsg && !isSelected ? existing.unreadCount + 1 : existing.unreadCount,
          };
        } else {
          updated.unshift({
            customerId: message.customerId,
            customerName: message.customerName || "Customer Baru",
            customerEmail: message.customerEmail || "",
            lastMessage: message.message,
            lastMessageAt: message.createdAt,
            unreadCount: isCustomerMsg && !isSelected ? 1 : 0,
            aiEnabled: true,
          });
        }
        return updated.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      });
    });

    // Listen for AI escalation events (customer requested human)
    channel.bind("ai-escalation", (data: { customerId: string; customerName?: string; reason?: string }) => {
      playChime();
      toast(`🚨 ${data.customerName || "Pelanggan"} meminta admin manusia!\n${data.reason || ""}`, {
        duration: 8000,
        icon: "🆘",
      });
      if (getNotificationPermission() === "granted") {
        showBrowserNotification(`🆘 ${data.customerName || "Pelanggan"} butuh admin`, {
          body: data.reason || "Pelanggan meminta berbicara dengan admin manusia",
          tag: `escalation-${data.customerId}`,
          url: "/admin/chat",
        });
      }
      // Update AI status in session list
      setSessions((prev) =>
        prev.map((s) => (s.customerId === data.customerId ? { ...s, aiEnabled: false } : s))
      );
    });

    // Listen for AI status changed (admin toggled AI)
    channel.bind("ai-status-changed", (data: { customerId: string; aiEnabled: boolean }) => {
      setSessions((prev) =>
        prev.map((s) => (s.customerId === data.customerId ? { ...s, aiEnabled: data.aiEnabled } : s))
      );
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [session]);

  const handleToggleAi = async () => {
    if (!selectedCustomerId || togglingAi) return;
    setTogglingAi(true);
    const newEnabled = !selectedAiEnabled;
    try {
      const res = await toggleAiForSession(selectedCustomerId, newEnabled);
      if (res.success) {
        setSessions((prev) =>
          prev.map((s) => (s.customerId === selectedCustomerId ? { ...s, aiEnabled: newEnabled } : s))
        );
        toast.success(newEnabled ? "AI Simbi diaktifkan" : "AI Simbi dinonaktifkan");
      } else {
        toast.error("Gagal mengubah status AI");
      }
    } catch {
      toast.error("Gagal mengubah status AI");
    } finally {
      setTogglingAi(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedCustomerId || sendingMessage) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSendingMessage(true);

    const tempMsg: Message = {
      id: Math.random().toString(),
      customerId: selectedCustomerId,
      senderId: session?.user?.id || null,
      senderType: "admin",
      message: textToSend,
      messageType: "text",
      isAiReply: false,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await sendChatMessage(selectedCustomerId, textToSend);
      if (res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? (res.message as Message) : m))
        );
        setSessions((prev) =>
          prev
            .map((s) =>
              s.customerId === selectedCustomerId
                ? { ...s, lastMessage: textToSend, lastMessageAt: new Date().toISOString() }
                : s
            )
            .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
        toast.error("Gagal mengirim pesan");
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      toast.error("Gagal mengirim pesan");
    } finally {
      setSendingMessage(false);
    }
  };

  const triggerTestNotification = async () => {
    playChime();
    const perm = getNotificationPermission();
    if (perm !== "granted") {
      toast.error(`Izin notifikasi: ${perm}`);
      return;
    }
    const sent = await showBrowserNotification("Test Notifikasi SimbioCommerce", {
      body: "Ini adalah notifikasi percobaan dari dashboard admin.",
      tag: "test-notification",
      url: "/admin/chat",
    });
    if (sent) toast.success("Notifikasi percobaan terkirim!");
    else toast.error("Gagal memicu notifikasi. Periksa pengaturan browser Anda.");
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      }
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(
      (s) =>
        s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sessions, searchQuery]);

  function renderMessage(msg: Message) {
    const isMe = msg.senderType === "admin";
    const time = formatTime(msg.createdAt);

    if (msg.messageType === "product_card") {
      const data = parseRichMessage(msg) as ProductCardData | null;
      return (
        <div key={msg.id} className="flex flex-col items-start">
          <div className="flex items-center gap-1 mb-1 ml-1">
            <span className="text-[9px] text-body font-medium">Simbi</span>
            <AiBadge />
          </div>
          {data && <AdminProductCardBubble data={data} />}
          <span className="text-[9px] text-body mt-1 px-1">{time}</span>
        </div>
      );
    }

    if (msg.messageType === "order_info") {
      const data = parseRichMessage(msg) as OrderInfoData | null;
      return (
        <div key={msg.id} className="flex flex-col items-start">
          <div className="flex items-center gap-1 mb-1 ml-1">
            <span className="text-[9px] text-body font-medium">Simbi</span>
            <AiBadge />
          </div>
          {data && <AdminOrderInfoBubble data={data} />}
          <span className="text-[9px] text-body mt-1 px-1">{time}</span>
        </div>
      );
    }

    if (msg.messageType === "order_list") {
      const data = parseRichMessage(msg) as OrderListData | null;
      return (
        <div key={msg.id} className="flex flex-col items-start">
          <div className="flex items-center gap-1 mb-1 ml-1">
            <span className="text-[9px] text-body font-medium">Simbi</span>
            <AiBadge />
          </div>
          {data && <AdminOrderListBubble data={data} />}
          <span className="text-[9px] text-body mt-1 px-1">{time}</span>
        </div>
      );
    }

    return (
      <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
        {!isMe && msg.isAiReply && (
          <div className="flex items-center gap-1 mb-1 ml-1">
            <span className="text-[9px] text-body font-medium">Simbi</span>
            <AiBadge />
          </div>
        )}
        <div
          className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
            isMe
              ? "bg-blue text-white rounded-tr-none"
              : "bg-white text-dark border border-gray-2 rounded-tl-none"
          }`}
        >
          <p className="leading-relaxed break-words">{msg.message}</p>
        </div>
        {isMe && msg.isAiReply && (
          <div className="flex items-center gap-0.5 mt-0.5 mr-1">
            <span className="text-[8px] text-body">Simbi</span>
            <AiBadge />
          </div>
        )}
        <span className="text-[9px] text-body mt-1 px-1">{time}</span>
      </div>
    );
  }

  return (
    <div className="flex bg-white rounded-2xl border border-gray-3 overflow-hidden shadow-1 h-[calc(100vh-140px)] min-h-[480px]">
      {/* Left panel: Session list */}
      <div className="w-80 md:w-96 border-r border-gray-3 flex flex-col h-full bg-white flex-shrink-0">
        <div className="p-4 border-b border-gray-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-dark">Live Chat</h2>
            {notificationPermission === "granted" ? (
              <div className="flex items-center gap-2">
                <button type="button" onClick={triggerTestNotification} className="text-[10px] text-blue hover:underline font-bold">
                  Uji Coba
                </button>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-green/10 text-green">
                  <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                  Aktif
                </span>
              </div>
            ) : notificationPermission === "denied" ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-red/10 text-red">
                <span className="w-1.5 h-1.5 rounded-full bg-red" />
                Diblokir
              </span>
            ) : null}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-2 rounded-xl pl-10 pr-4 py-2.5 text-xs text-dark placeholder:text-gray-5 border border-transparent focus:border-blue/20 outline-none transition-all"
            />
            <svg className="absolute left-3.5 top-3 w-4 h-4 text-gray-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {notificationPermission === "default" && (
          <div className="mx-4 mt-2 mb-2 p-3 bg-blue/10 rounded-xl flex items-center justify-between gap-2 border border-blue/20">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-blue">Aktifkan Notifikasi Browser</p>
              <p className="text-[9px] text-body mt-0.5">Dapatkan pemberitahuan saat ada chat baru.</p>
            </div>
            <button onClick={requestPermission} className="px-2.5 py-1 bg-blue text-white rounded-lg text-[9px] font-bold hover:bg-blue-dark transition-all flex-shrink-0">
              Aktifkan
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-gray-2">
          {loadingSessions ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <div className="w-6 h-6 border-2 border-blue border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-body">Memuat percakapan...</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <span className="text-2xl mb-2">💬</span>
              <p className="text-xs font-semibold text-dark">Tidak ada percakapan</p>
              <p className="text-[10px] text-body mt-1">Belum ada pelanggan yang menghubungi toko Anda.</p>
            </div>
          ) : (
            filteredSessions.map((item) => {
              const isSelected = item.customerId === selectedCustomerId;
              return (
                <button
                  key={item.customerId}
                  onClick={() => handleSelectSession(item.customerId)}
                  className={`w-full flex items-start gap-3 p-4 text-left transition-colors duration-150 hover:bg-gray-1 ${
                    isSelected ? "bg-blue/5 border-l-4 border-blue" : "border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4 className="text-xs font-bold text-dark truncate">{item.customerName}</h4>
                        {!item.aiEnabled && (
                          <span className="flex-shrink-0 inline-flex items-center px-1 py-0.5 rounded text-[8px] font-bold bg-orange-100 text-orange-600">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-5 flex-shrink-0 ml-1">{formatTime(item.lastMessageAt)}</span>
                    </div>
                    <p className="text-[10px] text-gray-5 truncate mb-1">{item.customerEmail}</p>
                    <p className={`text-xs truncate ${item.unreadCount > 0 ? "font-semibold text-dark" : "text-body"}`}>
                      {item.lastMessage.startsWith("{") ? "📎 Rich message" : item.lastMessage}
                    </p>
                  </div>
                  {item.unreadCount > 0 && (
                    <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-red text-white text-[10px] font-bold">
                      {item.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel: Active chat timeline */}
      <div className="flex-1 flex flex-col h-full bg-gray-1">
        {selectedCustomerId ? (
          <>
            {/* Header */}
            <div className="px-6 py-3.5 bg-white border-b border-gray-3 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-dark">{selectedCustomer?.customerName}</h3>
                <span className="text-[10px] text-body">{selectedCustomer?.customerEmail}</span>
              </div>

              {/* AI Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-body whitespace-nowrap">
                    {selectedAiEnabled ? "✦ Simbi AI aktif" : "Balas manual"}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleAi}
                    disabled={togglingAi}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                      selectedAiEnabled ? "bg-purple-500" : "bg-gray-3"
                    }`}
                    title={selectedAiEnabled ? "Nonaktifkan AI, balas manual" : "Aktifkan AI Simbi"}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        selectedAiEnabled ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green animate-pulse" />
                  <span className="text-xs font-semibold text-dark">Terhubung</span>
                </div>
              </div>
            </div>

            {/* AI disabled banner */}
            {!selectedAiEnabled && (
              <div className="mx-4 mt-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-2">
                <span className="text-orange-500 text-sm">⚠️</span>
                <p className="text-[10px] text-orange-700 font-medium">
                  AI Simbi dinonaktifkan untuk sesi ini. Semua pesan akan dibalas secara manual.
                </p>
              </div>
            )}

            {/* Message Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                  <div className="w-6 h-6 border-2 border-blue border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-body">Memuat riwayat chat...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <p className="text-xs text-body font-semibold">Memulai chat baru</p>
                  <p className="text-[10px] text-body mt-1">Ketikkan pesan di bawah untuk membalas pelanggan ini.</p>
                </div>
              ) : (
                messages.map((msg) => renderMessage(msg))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-white border-t border-gray-3">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ketik balasan Anda..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-gray-2 rounded-xl px-4 py-3 text-xs text-dark placeholder:text-gray-5 border border-transparent focus:border-blue/20 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sendingMessage}
                  className="flex items-center justify-center px-6 rounded-xl bg-blue text-white hover:bg-blue-dark transition-colors disabled:opacity-50 text-xs font-semibold"
                >
                  {sendingMessage ? "Mengirim..." : "Kirim"}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-1">
            <div className="w-16 h-16 rounded-full bg-blue/5 flex items-center justify-center text-blue mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-dark">Mulai Percakapan</h3>
            <p className="text-xs text-body mt-1 max-w-[280px]">
              Pilih pelanggan di sebelah kiri. Pesan otomatis dijawab oleh Simbi AI, atau nonaktifkan AI untuk balas manual.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
