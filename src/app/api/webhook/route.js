// Webhook oficial de WhatsApp Cloud API.
// GET  -> verificación del webhook (Meta).
// POST -> recepción de mensajes entrantes.

import { NextResponse } from "next/server";
import { processIncoming } from "@/lib/engine.js";
import { fetchWhatsAppMediaAsDataUrl } from "@/lib/whatsapp.js";

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

  console.log("[webhook] payload completo:", JSON.stringify(body, null, 2));

  try {
    const entries = body?.entry ?? [];
    for (const entry of entries) {
      const changes = entry?.changes ?? [];
      for (const change of changes) {
        const value = change?.value;

        if (!value?.messages) {
          console.log("[webhook] cambio sin mensajes (probablemente status update), ignorando.");
          continue;
        }

        const messages = value.messages;
        for (const message of messages) {
          const from = message.from;
          if (!from) {
            console.error("[webhook] Mensaje sin campo 'from':", JSON.stringify(message));
            continue;
          }

          let text = "";
          let payloadId;
          let imageDataUrl;
          let mediaCaption;

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
          } else if (message.type === "image") {
            // Imagen entrante: la descargamos y la pasamos como data URL.
            // NO se persiste en DB — sólo se ve en el chat hasta que reinicie el server.
            const mediaId = message.image?.id;
            mediaCaption  = message.image?.caption || "";
            imageDataUrl  = await fetchWhatsAppMediaAsDataUrl(mediaId);
            text          = mediaCaption || "[imagen recibida]";
            console.log(`[webhook] imagen recibida de ${from} | media_id=${mediaId} | descargada=${Boolean(imageDataUrl)}`);
          } else {
            console.log(`[webhook] tipo de mensaje no soportado: ${message.type}`);
            text = "";
          }

          console.log(`[webhook] procesando mensaje de ${from} | tipo: ${message.type} | text: "${text}" | payloadId: "${payloadId}"`);

          await processIncoming({
            conversationId: from,
            text,
            payloadId,
            source: "whatsapp",
            imageDataUrl,
            mediaCaption,
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
