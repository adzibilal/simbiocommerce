"use server";

import { db } from "@/db";
import { chatMessages, chatSessionSettings, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { pusherServer } from "@/lib/pusher";

const INTERNAL_SECRET = process.env.AI_INTERNAL_SECRET || "simbi-internal-ai-secret";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function getChatMessages(customerId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const isAdmin = session.user.role === "admin";
  if (!isAdmin && session.user.id !== customerId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const messages = await db
      .select({
        id: chatMessages.id,
        customerId: chatMessages.customerId,
        senderId: chatMessages.senderId,
        senderType: chatMessages.senderType,
        message: chatMessages.message,
        messageType: chatMessages.messageType,
        isAiReply: chatMessages.isAiReply,
        isRead: chatMessages.isRead,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.customerId, customerId))
      .orderBy(chatMessages.createdAt);

    return { success: true, messages };
  } catch (error: any) {
    console.error("Failed to get chat messages:", error);
    return { success: false, error: error.message };
  }
}

export async function sendChatMessage(customerId: string, messageText: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const senderId = session.user.id;
  const isAdmin = session.user.role === "admin";

  if (!isAdmin && senderId !== customerId) {
    return { success: false, error: "Unauthorized" };
  }

  const senderType = isAdmin ? "admin" : "customer";

  try {
    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        customerId,
        senderId,
        senderType,
        message: messageText,
        messageType: "text",
        isAiReply: false,
        isRead: false,
      })
      .returning();

    // Fetch customer info to attach to admin broadcast
    const [customer] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, customerId))
      .limit(1);

    // Trigger Pusher for customer channel
    await pusherServer.trigger(`private-chat-${customerId}`, "new-message", newMessage);

    // Trigger Pusher for admin notification channel
    await pusherServer.trigger("private-chat-admin-notifications", "new-message", {
      ...newMessage,
      customerName: customer?.name || "Customer Baru",
      customerEmail: customer?.email || "",
    });

    // If message is from customer, trigger AI reply in background (fire and forget)
    if (!isAdmin) {
      fetch(`${BASE_URL}/api/chat/ai-reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ai-secret": INTERNAL_SECRET,
        },
        body: JSON.stringify({
          customerId,
          customerName: customer?.name || "Pelanggan",
        }),
      }).catch(() => {}); // Fire and forget — don't block
    }

    return { success: true, message: newMessage };
  } catch (error: any) {
    console.error("Failed to send chat message:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminChatSessions() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const allMessages = await db
      .select({
        id: chatMessages.id,
        customerId: chatMessages.customerId,
        senderId: chatMessages.senderId,
        senderType: chatMessages.senderType,
        message: chatMessages.message,
        messageType: chatMessages.messageType,
        isAiReply: chatMessages.isAiReply,
        isRead: chatMessages.isRead,
        createdAt: chatMessages.createdAt,
        customerName: users.name,
        customerEmail: users.email,
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.customerId, users.id))
      .orderBy(desc(chatMessages.createdAt));

    // Also fetch AI settings for all customers
    const allSettings = await db.select().from(chatSessionSettings);
    const settingsMap = new Map(allSettings.map((s) => [s.customerId, s]));

    const sessionsMap = new Map<string, any>();
    for (const msg of allMessages) {
      const cid = msg.customerId;
      if (!sessionsMap.has(cid)) {
        const settings = settingsMap.get(cid);
        sessionsMap.set(cid, {
          customerId: cid,
          customerName: msg.customerName || "Customer Baru",
          customerEmail: msg.customerEmail || "",
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
          aiEnabled: settings ? settings.aiEnabled : true,
        });
      }

      if (!msg.isRead && msg.senderType === "customer") {
        sessionsMap.get(cid).unreadCount += 1;
      }
    }

    const sessions = Array.from(sessionsMap.values());
    return { success: true, sessions };
  } catch (error: any) {
    console.error("Failed to fetch admin chat sessions:", error);
    return { success: false, error: error.message };
  }
}

export async function markChatAsRead(customerId: string, byType: "admin" | "customer") {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const isAdmin = session.user.role === "admin";
  if (!isAdmin && session.user.id !== customerId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const targetSenderType = byType === "admin" ? "customer" : "admin";

    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(chatMessages.customerId, customerId),
          eq(chatMessages.senderType, targetSenderType)
        )
      );

    return { success: true };
  } catch (error: any) {
    console.error("Failed to mark chat as read:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleAiForSession(customerId: string, enabled: boolean) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .insert(chatSessionSettings)
      .values({ customerId, aiEnabled: enabled, updatedAt: new Date().toISOString() })
      .onConflictDoUpdate({
        target: chatSessionSettings.customerId,
        set: { aiEnabled: enabled, updatedAt: new Date().toISOString() },
      });

    // Notify admin channel of AI status change
    await pusherServer.trigger("private-chat-admin-notifications", "ai-status-changed", {
      customerId,
      aiEnabled: enabled,
    });

    return { success: true, aiEnabled: enabled };
  } catch (error: any) {
    console.error("Failed to toggle AI for session:", error);
    return { success: false, error: error.message };
  }
}

export async function getSessionAiStatus(customerId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const isAdmin = session.user.role === "admin";
  if (!isAdmin && session.user.id !== customerId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [settings] = await db
      .select()
      .from(chatSessionSettings)
      .where(eq(chatSessionSettings.customerId, customerId))
      .limit(1);

    return { success: true, aiEnabled: settings ? settings.aiEnabled : true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
