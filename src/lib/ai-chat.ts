import { db } from "@/db";
import { products, productImages, categories, orders, orderItems, users } from "@/db/schema";
import { eq, ilike, desc, and, or } from "drizzle-orm";

const AI_API_URL = process.env.AI_API_URL || "https://ai.adzibilal.my.id/v1";
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "free-model";

const SYSTEM_PROMPT = `Kamu adalah asisten AI SimbioStore bernama "Simbi". Kamu membantu pelanggan dengan pertanyaan seputar produk, pesanan, dan layanan toko elektronik.

Kategori produk yang tersedia di toko:
- Smartphone (HP, handphone, ponsel, iPhone, Samsung, Xiaomi, dll)
- Laptop (notebook, MacBook, ThinkPad, ROG, dll)
- PC & Komputer (desktop, gaming PC, all-in-one)
- Tablet (iPad, Samsung Tab, dll)
- Audio (headphone, TWS, earphone, speaker)
- Smartwatch (jam tangan pintar, Apple Watch, dll)
- Kamera (DSLR, mirrorless, action cam)
- Aksesoris HP (case, charger, kabel, dll)

Kemampuanmu:
- list_all_products: tampilkan semua produk yang tersedia (gunakan ini untuk "produk apa saja", "semua produk", dll)
- search_products: cari produk berdasarkan nama/merek/kategori
- get_order_by_id: cek detail satu pesanan
- get_customer_orders: lihat riwayat pesanan pelanggan
- send_product_card: tampilkan kartu produk setelah mendapat hasil pencarian
- send_order_info: tampilkan info pesanan
- request_human_agent: alihkan ke admin jika diminta

PENTING — Aturan pencarian produk:
1. Jika pelanggan tanya "hp", "handphone", "ponsel" → gunakan search_products dengan query "Smartphone"
2. Jika pelanggan minta "daftar semua produk" atau "produk apa saja" → SELALU gunakan list_all_products
3. Jika search_products tidak ada hasil → coba list_all_products
4. JANGAN PERNAH mengatakan "stok kosong" atau "tidak ada produk" tanpa mencoba list_all_products
5. Setelah mendapat hasil produk, tampilkan dengan send_product_card (maks 3 produk)

PENTING — Aturan cek pesanan (KEAMANAN PRIVASI):
1. Jika pelanggan tanya "pesanan saya", "cek order saya", "status belanja", "riwayat pembelian" → panggil get_customer_orders lalu send_order_list
2. Jika pelanggan sebut ID pesanan tertentu → panggil get_order_by_id(orderId) lalu send_order_info
3. WAJIB TOLAK jika pelanggan meminta pesanan orang lain (sebut nama/email lain): jawab "Maaf, saya hanya bisa menampilkan pesanan milik akun Anda sendiri. Saya tidak dapat mengakses data pesanan orang lain."
4. JANGAN PERNAH menampilkan data pesanan sebagai milik email/nama orang lain — selalu klarifikasi bahwa data yang ditampilkan adalah milik pelanggan yang sedang login
5. Jika tidak ada pesanan → beritahu dengan ramah bahwa belum ada pesanan

Panduan respons:
- Selalu ramah dan profesional
- Jawab dalam Bahasa Indonesia
- Jawab ringkas, maks 2-3 kalimat teks biasa
- Jangan sebut "AI" atau "Bot"
- Jika ada beberapa produk relevan, tampilkan maks 3 kartu produk

BATASAN TOPIK (WAJIB DIPATUHI):
- Kamu HANYA boleh membahas hal yang berkaitan dengan SimbioStore: produk, pesanan, pengiriman, pembayaran, dan layanan toko
- TOLAK semua pertanyaan di luar konteks SimbioStore: pemrograman, matematika, pengetahuan umum, berita, rekomendasi non-produk, dll
- Jika ditanya di luar topik, jawab PERSIS: "Maaf, saya hanya bisa membantu seputar produk dan layanan SimbioStore. Ada yang bisa saya bantu terkait belanja Anda? 😊"
- JANGAN menjawab meski pertanyaan off-topic muncul di tengah pertanyaan on-topic — selesaikan bagian on-topic saja, lalu abaikan bagian off-topic`;

const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "list_all_products",
      description: "Tampilkan semua produk yang tersedia di toko. Gunakan ini saat pelanggan minta 'daftar produk', 'produk apa saja', 'semua produk', atau saat search_products tidak ada hasil.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Jumlah produk yang ditampilkan (default 6, maks 10)", default: 6 },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Cari produk berdasarkan nama produk, merek, atau nama kategori. Contoh: 'iPhone', 'Samsung', 'Laptop', 'Smartphone', 'Audio'.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Kata kunci: nama produk, merek, atau kategori" },
          limit: { type: "number", description: "Jumlah hasil (default 3)", default: 3 },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_order_by_id",
      description: "Ambil detail pesanan berdasarkan ID pesanan",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "ID pesanan" },
        },
        required: ["orderId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_customer_orders",
      description: "Ambil daftar pesanan milik pelanggan ini saja (aman, hanya bisa lihat pesanannya sendiri). Gunakan ini saat pelanggan tanya 'pesanan saya', 'cek order', 'status belanja'.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Jumlah pesanan (default 5)", default: 5 },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_order_list",
      description: "Tampilkan daftar pesanan pelanggan dalam bentuk kartu ringkas. Gunakan setelah memanggil get_customer_orders.",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "Pesan pengantar sebelum daftar pesanan" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_product_card",
      description: "Kirim kartu produk ke pelanggan. Gunakan setelah mencari produk yang relevan.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string", description: "ID produk yang akan ditampilkan" },
          text: { type: "string", description: "Pesan teks yang menyertai kartu produk" },
        },
        required: ["productId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_order_info",
      description: "Kirim informasi detail pesanan ke pelanggan",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "ID pesanan yang akan ditampilkan" },
          text: { type: "string", description: "Pesan teks yang menyertai info pesanan" },
        },
        required: ["orderId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "request_human_agent",
      description: "Alihkan percakapan ke admin manusia. Gunakan jika pelanggan meminta admin atau kamu tidak bisa menyelesaikan masalah.",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string", description: "Alasan eskalasi ke admin manusia" },
        },
        required: ["reason"],
      },
    },
  },
];

// Tool executor: list all active products
async function toolListAllProducts(limit: number = 6) {
  try {
    const results = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        stock: products.stock,
        slug: products.slug,
        categoryName: categories.name,
        imageUrl: productImages.imageUrl,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)))
      .where(eq(products.isActive, true))
      .limit(Math.min(limit, 10));

    return results.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      slug: p.slug,
      category: p.categoryName || null,
      imageUrl: p.imageUrl || null,
    }));
  } catch (err) {
    console.error("toolListAllProducts error:", err);
    return [];
  }
}

// Tool executor: search products by name OR category name
async function toolSearchProducts(query: string, limit: number = 3) {
  try {
    const results = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        stock: products.stock,
        slug: products.slug,
        categoryName: categories.name,
        imageUrl: productImages.imageUrl,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)))
      .where(
        and(
          eq(products.isActive, true),
          or(
            ilike(products.name, `%${query}%`),
            ilike(categories.name, `%${query}%`)
          )
        )
      )
      .limit(limit);

    return results.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      slug: p.slug,
      category: p.categoryName || null,
      imageUrl: p.imageUrl || null,
    }));
  } catch (err) {
    console.error("toolSearchProducts error:", err);
    return [];
  }
}

// Tool executor: get order by ID
async function toolGetOrderById(orderId: string, customerId: string) {
  try {
    const [order] = await db
      .select({
        id: orders.id,
        orderStatus: orders.orderStatus,
        orderDate: orders.orderDate,
        grandTotal: orders.grandTotal,
        totalShippingCost: orders.totalShippingCost,
        userId: orders.userId,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) return null;
    // Only allow customer to see their own orders
    if (order.userId !== customerId) return null;

    const items = await db
      .select({
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        productName: products.name,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return {
      id: order.id,
      orderStatus: order.orderStatus,
      orderDate: order.orderDate,
      grandTotal: order.grandTotal,
      totalShippingCost: order.totalShippingCost,
      items: items.map((i) => ({
        name: i.productName || "Produk",
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    };
  } catch {
    return null;
  }
}

// Tool executor: get customer orders (with items, ONLY for the authenticated customer)
async function toolGetCustomerOrders(customerId: string, limit: number = 5) {
  try {
    const recentOrders = await db
      .select({
        id: orders.id,
        orderStatus: orders.orderStatus,
        orderDate: orders.orderDate,
        grandTotal: orders.grandTotal,
        totalShippingCost: orders.totalShippingCost,
      })
      .from(orders)
      .where(eq(orders.userId, customerId)) // SECURITY: only this customer's orders
      .orderBy(desc(orders.orderDate))
      .limit(Math.min(limit, 10));

    if (recentOrders.length === 0) return [];

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      recentOrders.map(async (order) => {
        const items = await db
          .select({
            quantity: orderItems.quantity,
            unitPrice: orderItems.unitPrice,
            productName: products.name,
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          id: order.id,
          orderStatus: order.orderStatus,
          orderDate: order.orderDate,
          grandTotal: order.grandTotal,
          totalShippingCost: order.totalShippingCost,
          items: items.map((i) => ({
            name: i.productName || "Produk",
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        };
      })
    );

    return ordersWithItems;
  } catch (err) {
    console.error("toolGetCustomerOrders error:", err);
    return [];
  }
}

// Tool executor: get product detail for card
async function toolGetProductById(productId: string) {
  try {
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        stock: products.stock,
        slug: products.slug,
        description: products.description,
        imageUrl: productImages.imageUrl,
      })
      .from(products)
      .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)))
      .where(eq(products.id, productId))
      .limit(1);

    return product || null;
  } catch {
    return null;
  }
}

/**
 * Parses the AI API response which may be:
 * 1. Plain JSON (stream:false working correctly)
 * 2. JSON followed by extra content e.g. "\ndata: [DONE]"
 * 3. SSE streaming chunks ("data: {...}\n\ndata: [DONE]")
 * Returns a standard chat completion object with choices[0].message
 */
function parseAiResponse(rawText: string): any | null {
  const text = rawText.trim();

  // Case 1: plain JSON
  try {
    return JSON.parse(text);
  } catch {}

  // Case 2: JSON with trailing junk — find end of first top-level JSON object
  try {
    const firstBrace = text.indexOf("{");
    if (firstBrace !== -1) {
      // Walk forward to find matching closing brace
      let depth = 0;
      let end = -1;
      for (let i = firstBrace; i < text.length; i++) {
        if (text[i] === "{") depth++;
        else if (text[i] === "}") {
          depth--;
          if (depth === 0) { end = i; break; }
        }
      }
      if (end !== -1) {
        return JSON.parse(text.slice(firstBrace, end + 1));
      }
    }
  } catch {}

  // Case 3: SSE streaming — accumulate all data chunks into one synthetic response
  const lines = text.split("\n");
  const chunks: any[] = [];
  for (const line of lines) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (payload === "[DONE]") continue;
    try { chunks.push(JSON.parse(payload)); } catch {}
  }
  if (chunks.length === 0) return null;

  // Merge streaming chunks into one response object
  const first = chunks[0];
  let content = "";
  const toolCallsMap: Record<number, any> = {};

  for (const chunk of chunks) {
    const delta = chunk.choices?.[0]?.delta;
    if (!delta) continue;
    if (delta.content) content += delta.content;
    if (delta.tool_calls) {
      for (const tc of delta.tool_calls) {
        const idx = tc.index ?? 0;
        if (!toolCallsMap[idx]) {
          toolCallsMap[idx] = { id: tc.id, type: tc.type, function: { name: "", arguments: "" } };
        }
        if (tc.function?.name) toolCallsMap[idx].function.name += tc.function.name;
        if (tc.function?.arguments) toolCallsMap[idx].function.arguments += tc.function.arguments;
      }
    }
  }

  const toolCalls = Object.values(toolCallsMap);
  return {
    id: first.id,
    object: "chat.completion",
    choices: [{
      message: {
        role: "assistant",
        content: content || null,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      },
      finish_reason: chunks[chunks.length - 1]?.choices?.[0]?.finish_reason || "stop",
    }],
  };
}

export interface OrderDetail {
  id: string;
  orderStatus: string | null;
  orderDate: string | null;
  grandTotal: number;
  totalShippingCost: number;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
}

export interface AiReplyMessage {
  type: "text" | "product_card" | "order_info" | "order_list" | "human_escalation";
  text: string;
  product?: {
    id: string;
    name: string;
    price: number;
    stock: number;
    slug: string;
    imageUrl: string | null;
    description: string | null;
  };
  order?: OrderDetail;
  orders?: OrderDetail[];  // for order_list
  reason?: string;
}

interface ChatHistoryEntry {
  senderType: string;
  message: string;
  messageType: string;
  isAiReply: boolean;
}

export async function generateAiReply(
  customerId: string,
  customerName: string,
  history: ChatHistoryEntry[],
  newMessage: string
): Promise<AiReplyMessage[]> {
  // Build conversation messages for AI
  const conversationMessages: any[] = [
    {
      role: "system",
      content: `${SYSTEM_PROMPT}

KONTEKS SESI INI:
- Pelanggan yang sedang login: ${customerName}
- ID akun: ${customerId}
- Semua data pesanan yang bisa diakses adalah HANYA milik pelanggan ini
- Jika ada permintaan data akun/pesanan orang lain (email/nama berbeda), TOLAK dengan sopan`,
    },
  ];

  // Add recent history (last 10 messages for context)
  const recentHistory = history.slice(-10);
  for (const msg of recentHistory) {
    const role = msg.senderType === "customer" ? "user" : "assistant";
    // For rich messages, use a summarized text version
    let content = msg.message;
    if (msg.messageType !== "text") {
      try {
        const parsed = JSON.parse(msg.message);
        content = parsed.text || msg.message;
      } catch {
        content = msg.message;
      }
    }
    conversationMessages.push({ role, content });
  }

  // Add the new customer message
  conversationMessages.push({ role: "user", content: newMessage });

  const results: AiReplyMessage[] = [];
  let iteration = 0;
  const MAX_ITERATIONS = 5;
  // Cache orders fetched this session so send_order_list can use them
  let cachedCustomerOrders: Awaited<ReturnType<typeof toolGetCustomerOrders>> = [];

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    let response: any;
    try {
      const res = await fetch(`${AI_API_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: conversationMessages,
          tools: AI_TOOLS,
          tool_choice: "auto",
          temperature: 0.7,
          max_tokens: 500,
          stream: false,
        }),
      });

      if (!res.ok) {
        console.error("AI API error:", res.status, await res.text());
        break;
      }

      // Parse response — handle both plain JSON and SSE streaming format
      const rawText = await res.text();
      response = parseAiResponse(rawText);
      if (!response) {
        console.error("AI API: could not parse response:", rawText.slice(0, 200));
        break;
      }
    } catch (err) {
      console.error("AI API fetch failed:", err);
      break;
    }

    const choice = response.choices?.[0];
    if (!choice) break;

    const assistantMessage = choice.message;
    conversationMessages.push(assistantMessage);

    // No more tool calls — final text response
    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      const text = assistantMessage.content?.trim();
      if (text) {
        results.push({ type: "text", text });
      }
      break;
    }

    // Log tool calls for debugging
    console.log("[Simbi] Tool calls:", assistantMessage.tool_calls.map((tc: any) => `${tc.function.name}(${tc.function.arguments})`).join(", "));

    // Process tool calls
    let shouldStop = false;
    for (const toolCall of assistantMessage.tool_calls) {
      const fnName = toolCall.function.name;
      let args: any = {};
      try {
        args = JSON.parse(toolCall.function.arguments || "{}");
      } catch {}

      let toolResult: any = null;

      if (fnName === "list_all_products") {
        const all = await toolListAllProducts(args.limit || 6);
        if (all.length > 0) {
          toolResult = all;
        } else {
          toolResult = "Belum ada produk aktif di toko.";
        }

      } else if (fnName === "search_products") {
        const found = await toolSearchProducts(args.query, args.limit || 3);
        if (found.length > 0) {
          toolResult = found;
        } else {
          // Auto-fallback: try list all so AI has data
          const allProducts = await toolListAllProducts(6);
          toolResult = allProducts.length > 0
            ? { message: `Tidak ada produk dengan kata kunci "${args.query}". Berikut semua produk yang tersedia:`, products: allProducts }
            : "Belum ada produk aktif di toko.";
        }

      } else if (fnName === "get_order_by_id") {
        // SECURITY: toolGetOrderById only returns if order.userId === customerId
        const order = await toolGetOrderById(args.orderId, customerId);
        toolResult = order
          ? { notice: "Pesanan ini milik pelanggan yang sedang login.", order }
          : "Pesanan tidak ditemukan atau Anda tidak memiliki akses ke pesanan ini.";

      } else if (fnName === "send_order_list") {
        if (cachedCustomerOrders.length > 0) {
          results.push({
            type: "order_list",
            text: args.text || "Berikut daftar pesanan kamu:",
            orders: cachedCustomerOrders,
          });
          toolResult = `Daftar ${cachedCustomerOrders.length} pesanan berhasil ditampilkan.`;
        } else {
          toolResult = "Belum ada data pesanan yang tersedia. Panggil get_customer_orders terlebih dahulu.";
        }

      } else if (fnName === "get_customer_orders") {
        // SECURITY: always use the authenticated customerId — never allow targeting another user
        const customerOrders = await toolGetCustomerOrders(customerId, args.limit || 5);
        cachedCustomerOrders = customerOrders;
        toolResult = customerOrders.length > 0
          ? {
              notice: "Data ini hanya milik pelanggan yang sedang login. Presentasikan sebagai pesanan milik mereka sendiri.",
              count: customerOrders.length,
              orders: customerOrders,
            }
          : "Belum ada pesanan untuk akun ini.";

      } else if (fnName === "send_product_card") {
        const product = await toolGetProductById(args.productId);
        if (product) {
          results.push({
            type: "product_card",
            text: args.text || `Berikut detail produk **${product.name}**:`,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              stock: product.stock,
              slug: product.slug,
              imageUrl: product.imageUrl || null,
              description: product.description || null,
            },
          });
          toolResult = `Kartu produk "${product.name}" berhasil dikirim.`;
        } else {
          toolResult = "Produk tidak ditemukan.";
        }

      } else if (fnName === "send_order_info") {
        const order = await toolGetOrderById(args.orderId, customerId);
        if (order) {
          results.push({
            type: "order_info",
            text: args.text || `Berikut detail pesanan **${order.id.slice(0, 8)}...**:`,
            order,
          });
          toolResult = `Info pesanan ${order.id} berhasil dikirim.`;
        } else {
          toolResult = "Pesanan tidak ditemukan.";
        }

      } else if (fnName === "request_human_agent") {
        results.push({
          type: "human_escalation",
          text: "Baik, saya akan menghubungkan kamu dengan admin kami. Mohon tunggu sebentar ya 😊",
          reason: args.reason || "Pelanggan meminta admin manusia",
        });
        toolResult = "Eskalasi ke admin berhasil.";
        shouldStop = true;
      }

      // Add tool result to conversation
      conversationMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult),
      });
    }

    if (shouldStop) break;
  }

  return results;
}
