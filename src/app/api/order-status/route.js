// Cambia el estado de pago/pedido de una conversación desde el panel.
//
// POST { conversationId, status }
//   status:
//     "pending"   → vuelve a marcar como pago pendiente (espera comprobante)
//     "verified"  → pago confirmado, pedido en preparación  (state = DONE)
//     "rejected"  → pago rechazado, vuelve al menú principal
//
// Manda automáticamente un mensaje al cliente por WhatsApp (si hay credenciales)
// y lo registra en el chat como mensaje del bot.

import { NextResponse } from "next/server";
import { getConversation, saveConversation, addMessage } from "@/lib/store.js";
import { sendWhatsAppMessage } from "@/lib/whatsapp.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { conversationId, status } = await req.json();
    if (!conversationId || !["pending", "verified", "rejected"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
    }

    const conv = await getConversation(conversationId);
    conv.data = { ...conv.data };

    let replyText = "";
    if (status === "verified") {
      conv.state = "DONE";
      conv.data.paymentStatus       = "verified";
      conv.data.awaitingVerification = false;
      conv.data.paymentRequested     = false;
      replyText =
        "✅ *Pago confirmado.* ¡Gracias!\n\n" +
        "Tu pedido ya está en preparación. " +
        "Te avisamos cuando esté listo. 🍽️";
    } else if (status === "rejected") {
      conv.state = "AWAIT_PAYMENT";
      conv.data.paymentStatus       = "rejected";
      conv.data.awaitingVerification = false;
      conv.data.paymentRequested     = true;
      replyText =
        "❌ *No pudimos confirmar el pago.*\n\n" +
        "Por favor reenviá el comprobante de transferencia o " +
        "comunicate con el local para resolverlo. 🙏";
    } else {
      // pending → volver al estado de espera
      conv.state = "WAIT_CONFIRM";
      conv.data.paymentStatus       = "pending";
      conv.data.awaitingVerification = true;
      conv.data.paymentRequested     = true;
      replyText =
        "⏳ Tu pago sigue *pendiente de verificación*.\n" +
        "Te avisamos en cuanto lo confirmemos.";
    }

    await saveConversation(conv);

    // Registrar mensaje en el chat (visible en el panel)
    await addMessage({
      conversationId,
      role: "bot",
      kind: "text",
      text: replyText,
      source: "agent",
    });

    // Mandar por WhatsApp si hay credenciales
    await sendWhatsAppMessage(conversationId, { kind: "text", text: replyText });

    return NextResponse.json({
      ok: true,
      status: conv.data.paymentStatus,
      state: conv.state,
    });
  } catch (err) {
    console.error("[order-status] Error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
