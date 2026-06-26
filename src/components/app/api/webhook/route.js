// Webhook oficial de WhatsApp Cloud API.
// GET  -> verificación del webhook (Meta).
// POST -> recepción de mensajes entrantes.

import { NextResponse } from "next/server";
import { processIncoming } from "@/lib/engine.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "mi_token_secreto";

export async function GET(req) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.error("[webhook] Body inválido:", err);
    return NextResponse.json({ ok: false });
  }

  try {
    const entries = body?.entry ?? [];
    for (const entry of entries) {
      const changes = entry?.changes ?? [];
      for (const change of changes) {
        const value = change?.value;

        // Meta manda eventos de estado de entrega sin mensajes — ignorar silenciosamente
        if (!value?.messages) continue;

        const messages = value.messages;
        for (const message of messages) {
          const from = message.from;

          if (!from) {
            console.error("[webhook] Mensaje sin campo 'from':", message.type);
            continue;
          }

          let text = "";
          let payloadId;

          if (message.type === "text") {
            text = message.text?.body ?? "";
          } else if (message.type === "interactive") {
            const inter = message.interactive;
            if (inter?.type === "button_reply") {
              payloadId = inter.button_reply?.id;
              text = inter.button_reply?.title ?? "";
            } else if (inter?.type === "list_reply") {
              payloadId = inter.list_reply?.id;
              text = inter.list_reply?.title ?? "";
            }
          } else if (message.type === "button") {
            payloadId = message.button?.payload;
            text = message.button?.text ?? "";
          }
          // Tipos no soportados (audio, imagen, sticker…): text queda vacío, el flujo lo maneja

          await processIncoming({
            conversationId: from,
            text,
            payloadId,
            source: "whatsapp",
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook] Error procesando payload:", err);
    return NextResponse.json({ ok: false });
  }
}
