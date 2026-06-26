// Envío manual desde el panel de agente.
// Registra el mensaje como rol "bot" y lo manda por WhatsApp,
// SIN pasar por el flujo automático (el bot está pausado para esa conv).

import { NextResponse } from "next/server";
import { addMessage } from "@/lib/store.js";
import { sendWhatsAppMessage } from "@/lib/whatsapp.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { conversationId, text } = await req.json();

    if (!conversationId || !text?.trim()) {
      return NextResponse.json({ ok: false, error: "Faltan campos" }, { status: 400 });
    }

    // Guardar el mensaje como si lo hubiera enviado el bot (role bot, source agent)
    await addMessage({
      conversationId,
      role: "bot",
      kind: "text",
      text: text.trim(),
      source: "agent",
    });

    // Enviar por WhatsApp si hay credenciales
    await sendWhatsAppMessage(conversationId, { kind: "text", text: text.trim() });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send] Error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
