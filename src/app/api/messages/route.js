// Mensajes — solo historial JSON.
// El LiveChat hace polling cada 1 segundo a este endpoint.
// (SSE eliminado: no funciona de forma confiable en entornos serverless como Vercel)

import { getMessages } from "@/lib/store.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const conversationId =
    req.nextUrl.searchParams.get("conversationId") || undefined;

  const messages = getMessages(conversationId);
  return Response.json(messages, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
