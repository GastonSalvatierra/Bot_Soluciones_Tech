// Simulador local: permite probar el flujo completo sin WhatsApp conectado.
// Recibe texto o un payloadId (boton/fila) y lo procesa como si llegara del
// webhook real, pero marcado como source = "simulator".

import { NextResponse } from "next/server";
import { processIncoming } from "@/lib/engine.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { conversationId, text, payloadId } = await req.json();
    const id = conversationId || "demo";

    await processIncoming({
      conversationId: id,
      text: text || "",
      payloadId,
      source: "simulator",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Simulate error:", err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
