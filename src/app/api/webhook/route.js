// Webhook oficial de WhatsApp Cloud API.
// GET  -> verificacion del webhook (Meta).
// POST -> recepcion de mensajes entrantes.

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
  try {
    const body = await req.json();

    const entries = body?.entry ?? [];
    for (const entry of entries) {
      const changes = entry?.changes ?? [];
      for (const change of changes) {
        const value = change?.value;
        const messages = value?.messages ?? [];
        for (const message of messages) {
          const from = message.from;
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
            // plantillas: respuesta de boton
            payloadId = message.button?.payload;
            text = message.button?.text ?? "";
          }

          await processIncoming({
            conversationId: from,
            text,
            payloadId,
            source: "whatsapp",
          });
        }
      }
    }

    // Meta requiere 200 rapido.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    // Devolvemos 200 igual para que Meta no reintente en loop.
    return NextResponse.json({ ok: false });
  }
}
