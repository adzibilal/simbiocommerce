import { NextResponse } from "next/server";
import { db } from "@/db";
import { chatMessages, chatSessionSettings, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { pusherServer } from "@/lib/pusher";
import { generateAiReply, AiReplyMessage } from "@/lib/ai-chat";

const INTERNAL_SECRET = process.env.AI_INTERNAL_SECRET || "simbi-internal-ai-secret";

export async function POST(req: Request) {
  // Verify internal call
  const secret = req.headers.get("x-ai-secret");
  if (secret !== INTERNAL_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  let customerId: string;
  let customerName: string;
  try {
    const body = await req.json();
    customerId = body.customerId;
    customerName = body.customerName || "Pelanggan";
  } catch {
    return new Response("Invalid body", { status: 400 });
  }

  if (!customerId) return new Response("Missing customerId", { status: 400 });

  try {
    // Check if AI is enabled for this session
    const [settings] = await db
      .select()
      .from(chatSessionSettings)
      .where(eq(chatSessionSettings.customerId, customerId))
      .limit(1);

    if (settings && !settings.aiEnabled) {
      return NextResponse.json({ skipped: true, reason: "AI disabled for this session" });
    }

    // Fetch recent conversation history (last 15 messages)
    const history = await db
      .select({
        id: chatMessages.id,
        senderType: chatMessages.senderType,
        message: chatMessages.message,
        messageType: chatMessages.messageType,
        isAiReply: chatMessages.isAiReply,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.customerId, customerId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(15);

    // Reverse so oldest first
    const sortedHistory = history.reverse();
    // The last message is the new customer message
    const newMessage = sortedHistory[sortedHistory.length - 1];
    if (!newMessage || newMessage.senderType !== "customer") {
      return NextResponse.json({ skipped: true, reason: "Last message not from customer" });
    }

    const historyWithoutLast = sortedHistory.slice(0, -1);

    // Generate AI reply
    const aiMessages = await generateAiReply(
      customerId,
      customerName,
      historyWithoutLast,
      newMessage.message
    );

    if (aiMessages.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    // Get customer email for admin broadcast
    const [customer] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, customerId))
      .limit(1);

    let humanEscalation = false;

    // Save each AI message and broadcast via Pusher
    for (const aiMsg of aiMessages) {
      const messageType =
        aiMsg.type === "product_card" ? "product_card"
        : aiMsg.type === "order_info" ? "order_info"
        : aiMsg.type === "order_list" ? "order_list"
        : "text";

      // For rich messages, serialize payload as JSON; for text/escalation just the text
      const messageContent =
        messageType === "text"
          ? aiMsg.text
          : JSON.stringify(aiMsg);

      const [saved] = await db
        .insert(chatMessages)
        .values({
          customerId,
          senderId: null,
          senderType: "admin",
          message: messageContent,
          messageType,
          isAiReply: true,
          isRead: false,
        })
        .returning();

      const pusherPayload = {
        ...saved,
        customerName: customer?.name || customerName,
        customerEmail: customer?.email || "",
      };

      // Notify customer channel
      await pusherServer.trigger(`private-chat-${customerId}`, "new-message", pusherPayload);

      // Notify admin channel
      await pusherServer.trigger("private-chat-admin-notifications", "new-message", pusherPayload);

      if (aiMsg.type === "human_escalation") {
        humanEscalation = true;
      }
    }

    // Handle human escalation: disable AI and send urgent admin Pusher event
    if (humanEscalation) {
      await db
        .insert(chatSessionSettings)
        .values({ customerId, aiEnabled: false, updatedAt: new Date().toISOString() })
        .onConflictDoUpdate({
          target: chatSessionSettings.customerId,
          set: { aiEnabled: false, updatedAt: new Date().toISOString() },
        });

      // Notify admin of urgent escalation
      await pusherServer.trigger("private-chat-admin-notifications", "ai-escalation", {
        customerId,
        customerName: customer?.name || customerName,
        customerEmail: customer?.email || "",
        reason: (aiMessages.find((m) => m.type === "human_escalation") as AiReplyMessage)?.reason,
      });
    }

    return NextResponse.json({ sent: aiMessages.length, humanEscalation });
  } catch (err: any) {
    console.error("AI reply processing error:", err);
    return new Response(err.message || "Internal error", { status: 500 });
  }
}
