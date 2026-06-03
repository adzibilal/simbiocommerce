import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    let socketId = "";
    let channelName = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      socketId = formData.get("socket_id") as string;
      channelName = formData.get("channel_name") as string;
    } else {
      const body = await req.json();
      socketId = body.socket_id;
      channelName = body.channel_name;
    }

    if (!socketId || !channelName) {
      return new Response("Missing parameters", { status: 400 });
    }

    // Ensure the channel name is private-chat-${customerId}
    if (!channelName.startsWith("private-chat-")) {
      return new Response("Invalid channel name", { status: 400 });
    }

    const customerId = channelName.replace("private-chat-", "");
    const isAdmin = session.user.role === "admin";

    // Only allow admin or the customer themselves to join
    if (!isAdmin && session.user.id !== customerId) {
      return new Response("Unauthorized channel access", { status: 403 });
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  } catch (error: any) {
    console.error("Pusher auth error:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
