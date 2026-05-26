"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { markContactRead, deleteContactMessage, replyContactMessage } from "@/app/actions/contact";

interface Props {
  msg: {
    id: string;
    firstName: string;
    lastName?: string | null;
    email: string;
    message: string;
    status: string | null;
  };
}

export default function ContactActions({ msg }: Props) {
  const router = useRouter();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const handleMarkRead = async () => {
    await markContactRead(msg.id);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Hapus pesan ini?")) return;
    await deleteContactMessage(msg.id);
    router.refresh();
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error("Tulis balasan terlebih dahulu");
      return;
    }
    setSending(true);
    const res = await replyContactMessage(msg.id, replyText.trim());
    setSending(false);
    if (res.success) {
      toast.success("Balasan berhasil dikirim!");
      setShowReply(false);
      setReplyText("");
      router.refresh();
    } else {
      toast.error(res.error ?? "Gagal mengirim balasan");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Reply */}
        <button
          type="button"
          onClick={() => setShowReply(true)}
          title="Reply"
          className="p-1.5 rounded hover:bg-blue/10 text-blue transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 17 4 12 9 7" />
            <path d="M20 18v-2a4 4 0 00-4-4H4" />
          </svg>
        </button>

        {/* Mark read */}
        {msg.status === "unread" && (
          <button
            type="button"
            onClick={handleMarkRead}
            title="Mark as read"
            className="p-1.5 rounded hover:bg-blue/10 text-blue transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        )}

        {/* Delete */}
        <button
          type="button"
          onClick={handleDelete}
          title="Delete"
          className="p-1.5 rounded hover:bg-red/10 text-red transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>

      {/* Reply Modal */}
      {showReply && (
        <div className="fixed inset-0 z-99999 bg-dark/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px]">
            <div className="px-6 pt-6 pb-4 border-b border-gray-2">
              <h3 className="font-bold text-lg text-dark">Balas Pesan</h3>
              <p className="text-sm text-dark-4 mt-0.5">ke: <span className="text-dark">{msg.email}</span></p>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Original message */}
              <div className="bg-gray-1 rounded-xl p-3 border border-gray-3">
                <p className="text-xs text-dark-4 mb-1">Pesan dari {msg.firstName}:</p>
                <p className="text-sm text-dark-2 line-clamp-3">{msg.message}</p>
              </div>

              {/* Reply textarea */}
              <textarea
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Tulis balasan kamu di sini..."
                className="w-full rounded-xl border border-gray-3 bg-gray-1 p-3 text-sm text-dark outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 resize-none"
                autoFocus
              />
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                type="button"
                onClick={() => { setShowReply(false); setReplyText(""); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-3 text-dark font-medium hover:bg-gray-1 transition-colors text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReply}
                disabled={sending || !replyText.trim()}
                className="flex-1 py-2.5 rounded-xl bg-blue text-white font-medium hover:bg-blue-dark transition-colors text-sm disabled:opacity-50"
              >
                {sending ? "Mengirim..." : "Kirim Balasan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
