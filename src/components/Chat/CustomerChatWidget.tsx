"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getChatMessages, sendChatMessage, markChatAsRead } from "@/app/actions/chat";
import { formatCurrency } from "@/lib/currency";
import Pusher from "pusher-js";
import toast from "react-hot-toast";
import {
  getNotificationPermission,
  requestNotificationPermission,
  showBrowserNotification,
} from "@/lib/notifications";

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
    description: string | null;
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
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-purple-100 text-purple-600 border border-purple-200 ml-1">
      ✦ AI
    </span>
  );
}

function ProductCardBubble({ data, time }: { data: ProductCardData; time: string }) {
  return (
    <div className="flex flex-col items-start space-y-1">
      <div className="flex items-center gap-1 ml-1">
        <span className="text-[9px] text-body font-medium">Simbi</span>
        <AiBadge />
      </div>
      {data.text && (
        <div className="max-w-[80%] bg-white text-dark border border-gray-2 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs shadow-1">
          <p className="leading-relaxed break-words">{data.text}</p>
        </div>
      )}
      <a
        href={`/products/${data.product.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-[220px] bg-white border border-gray-2 rounded-2xl overflow-hidden shadow-1 hover:shadow-md transition-shadow"
      >
        {data.product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.product.imageUrl}
            alt={data.product.name}
            className="w-full h-28 object-cover"
          />
        )}
        <div className="p-3 space-y-1">
          <p className="text-xs font-bold text-dark line-clamp-2">{data.product.name}</p>
          <p className="text-sm font-bold text-blue">{formatCurrency(data.product.price)}</p>
          <p className={`text-[10px] font-semibold ${data.product.stock > 0 ? "text-green" : "text-red"}`}>
            {data.product.stock > 0 ? `Stok: ${data.product.stock}` : "Habis"}
          </p>
          <span className="inline-block mt-1 px-3 py-1 bg-blue text-white text-[10px] font-semibold rounded-lg">
            Lihat Produk →
          </span>
        </div>
      </a>
      <span className="text-[9px] text-body px-1">{time}</span>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string | null }) {
  const s = ORDER_STATUS_LABELS[status || ""];
  if (!s) return <span className="text-[10px] font-bold text-body">{status || "-"}</span>;
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>;
}

function SingleOrderCard({ order }: { order: OrderSummary }) {
  return (
    <div className="w-[240px] bg-white border border-gray-2 rounded-xl shadow-1 p-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-body">ID</p>
        <p className="text-[10px] font-bold text-dark font-mono">{order.id.slice(0, 8)}...</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-body">Status</p>
        <OrderStatusBadge status={order.orderStatus} />
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

function OrderInfoBubble({ data, time }: { data: OrderInfoData; time: string }) {
  return (
    <div className="flex flex-col items-start space-y-1">
      <div className="flex items-center gap-1 ml-1">
        <span className="text-[9px] text-body font-medium">Simbi</span>
        <AiBadge />
      </div>
      {data.text && (
        <div className="max-w-[80%] bg-white text-dark border border-gray-2 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs shadow-1">
          <p className="leading-relaxed break-words">{data.text}</p>
        </div>
      )}
      <SingleOrderCard order={data.order} />
      <span className="text-[9px] text-body px-1">{time}</span>
    </div>
  );
}

function OrderListBubble({ data, time }: { data: OrderListData; time: string }) {
  return (
    <div className="flex flex-col items-start space-y-1">
      <div className="flex items-center gap-1 ml-1">
        <span className="text-[9px] text-body font-medium">Simbi</span>
        <AiBadge />
      </div>
      {data.text && (
        <div className="max-w-[80%] bg-white text-dark border border-gray-2 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs shadow-1">
          <p className="leading-relaxed break-words">{data.text}</p>
        </div>
      )}
      {data.orders.length === 0 ? (
        <div className="w-[240px] bg-white border border-gray-2 rounded-xl p-3 text-center">
          <p className="text-xs text-body">Belum ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {data.orders.map((order) => (
            <SingleOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
      <span className="text-[9px] text-body px-1">{time}</span>
    </div>
  );
}

export default function CustomerChatWidget() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState<string>("default");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const isOpenRef = useRef(false);

  const isLoggedIn = status === "authenticated" && session?.user;
  const customerId = session?.user?.id;

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isLoggedIn || !customerId) return;

    const loadHistory = async () => {
      const res = await getChatMessages(customerId);
      if (res.success && res.messages) {
        setMessages(res.messages as Message[]);
        const unreads = (res.messages as Message[]).filter(
          (m) => !m.isRead && m.senderType === "admin"
        ).length;
        setUnreadCount(unreads);
      }
    };

    loadHistory();

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: "/api/chat/auth",
    });
    pusherRef.current = pusher;

    const channel = pusher.subscribe(`private-chat-${customerId}`);

    channel.bind("new-message", (message: Message) => {
      if (message.senderId === customerId) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      if (message.senderType === "admin") {
        const isChatOpen = isOpenRef.current;
        if (isChatOpen) {
          markChatAsRead(customerId, "customer");
        } else {
          setUnreadCount((c) => c + 1);
          playChime();
          const label = message.isAiReply ? "Simbi AI" : "Admin Support";
          toast(`Pesan baru dari ${label}!`, { icon: "💬", duration: 4000 });
        }

        if (getNotificationPermission() === "granted" && (!isChatOpen || document.hidden)) {
          const label = message.isAiReply ? "Simbi AI" : "Admin Support";
          const body = message.messageType === "text" ? message.message : "Pesan baru tersedia";
          showBrowserNotification(`Pesan baru dari ${label}`, {
            body,
            tag: `chat-admin-${customerId}`,
          });
        }
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [isLoggedIn, customerId]);

  const handleOpenWidget = () => {
    setIsOpen(true);
    if (isLoggedIn && customerId && unreadCount > 0) {
      setUnreadCount(0);
      markChatAsRead(customerId, "customer");
    }
    if (getNotificationPermission() === "default") {
      requestNotificationPermission().then((perm) => setNotificationPermission(perm));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !customerId || loading) return;

    const textToSend = inputText.trim();
    setInputText("");
    setLoading(true);

    const tempMsg: Message = {
      id: Math.random().toString(),
      customerId,
      senderId: customerId,
      senderType: "customer",
      message: textToSend,
      messageType: "text",
      isAiReply: false,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await sendChatMessage(customerId, textToSend);
      if (res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? (res.message as Message) : m))
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
        toast.error("Gagal mengirim pesan");
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  if (session?.user?.role === "admin") return null;

  function renderMessage(msg: Message) {
    const isMe = msg.senderType === "customer";
    const time = formatTime(msg.createdAt);

    if (msg.messageType === "product_card") {
      const data = parseRichMessage(msg) as ProductCardData | null;
      if (data) return <ProductCardBubble key={msg.id} data={data} time={time} />;
    }

    if (msg.messageType === "order_info") {
      const data = parseRichMessage(msg) as OrderInfoData | null;
      if (data) return <OrderInfoBubble key={msg.id} data={data} time={time} />;
    }

    if (msg.messageType === "order_list") {
      const data = parseRichMessage(msg) as OrderListData | null;
      if (data) return <OrderListBubble key={msg.id} data={data} time={time} />;
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
          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-1 ${
            isMe
              ? "bg-blue text-white rounded-tr-none"
              : "bg-white text-dark border border-gray-2 rounded-tl-none"
          }`}
        >
          <p className="leading-relaxed break-words">{msg.message}</p>
        </div>
        <span className="text-[9px] text-body mt-1 px-1">{time}</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-9999 font-euclid-circular-a">
      {!isOpen && (
        <button
          onClick={handleOpenWidget}
          className="relative flex items-center justify-center w-14 h-14 bg-blue text-white rounded-full shadow-2xl hover:scale-105 transition-transform duration-200"
          aria-label="Open Chat"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red text-white text-[10px] font-bold ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="flex flex-col w-[350px] sm:w-[380px] h-[520px] bg-white rounded-2xl shadow-testimonial border border-gray-2 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-blue text-white">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green animate-pulse" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold">Customer Support</h3>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-white/20 text-white border border-white/30">
                    ✦ AI
                  </span>
                </div>
                <span className="text-[10px] text-white/80">Dijawab otomatis oleh Simbi AI</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-1">
            {!isLoggedIn ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue/10 flex items-center justify-center text-blue">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-dark">Silakan Login Dahulu</h4>
                  <p className="text-xs text-body mt-1 leading-relaxed">
                    Masuk ke akun Anda untuk dapat berkonsultasi dengan Simbi AI.
                  </p>
                </div>
                <a href="/signin" className="px-5 py-2 bg-blue text-white rounded-lg text-xs font-semibold hover:bg-blue-dark transition-colors inline-block">
                  Login Sekarang
                </a>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-2">
                <span className="text-3xl">🤖</span>
                <h4 className="text-sm font-bold text-dark">Halo! Saya Simbi AI</h4>
                <p className="text-xs text-body max-w-[240px]">
                  Tanya saya tentang produk, pesanan, atau ketik "minta admin" untuk bicara langsung dengan admin.
                </p>
              </div>
            ) : (
              messages.map((msg) => renderMessage(msg))
            )}
            <div ref={messagesEndRef} />
          </div>

          {isLoggedIn && (
            <form onSubmit={handleSendMessage} className="border-t border-gray-2 p-3 bg-white flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tanya Simbi AI..."
                className="flex-1 bg-gray-1 rounded-xl px-4 py-2 text-xs text-dark outline-none focus:bg-gray-2 border border-transparent focus:border-gray-3 transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue text-white hover:bg-blue-dark transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
