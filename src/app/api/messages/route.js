// Mensajes en tiempo real.
// GET sin ?stream  -> historial JSON.
// GET con ?stream=1 -> Server-Sent Events (push de mensajes nuevos).

import { getMessages } from "@/lib/store.js";
import { subscribe } from "@/lib/events.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const stream = req.nextUrl.searchParams.get("stream");
  const conversationId =
    req.nextUrl.searchParams.get("conversationId") || undefined;

  if (!stream) {
    return Response.json(getMessages(conversationId));
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      const enqueue = (obj) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      // Historial inicial.
      for (const m of getMessages(conversationId)) enqueue(m);

      const unsubscribe = subscribe((msg) => {
        if (!conversationId || msg.conversationId === conversationId) {
          enqueue(msg);
        }
      });

      // keep-alive
      const ping = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 25000);

      const close = () => {
        clearInterval(ping);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* ya cerrado */
        }
      };

      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
