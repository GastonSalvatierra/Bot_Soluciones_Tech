// Orquestador central: recibe un mensaje entrante (de WhatsApp o del simulador),
// lo registra, corre el flujo, guarda la conversación, registra y envía las respuestas.

import { handleIncoming } from "./flow.js";
import { generateAIReply } from "./openai.js";
import {
  addMessage,
  getConfig,
  getConversation,
  recordOutgoing,
  saveConversation,
} from "./store.js";
import { sendWhatsAppMessage, normalizePhone } from "./whatsapp.js";

/**
 * @param {object} input
 *   { conversationId, text, payloadId, source, imageDataUrl?, mediaCaption? }
 *
 *   imageDataUrl  → data:image/...;base64,...  (NO se persiste, sólo se muestra)
 *   mediaCaption  → caption opcional adjunto a una imagen entrante
 */
export async function processIncoming(input) {
  // Normalizar el número ANTES de usarlo como clave — corrige el bug del "9" argentino
  const conversationId =
    input.source === "whatsapp"
      ? normalizePhone(input.conversationId)
      : input.conversationId;

  const { text, payloadId, source, imageDataUrl, mediaCaption } = input;
  const config = await getConfig();

  // 1) Registrar el mensaje del usuario
  //    Si llegó una imagen: kind="image" + imageDataUrl efímero (no se guarda en DB)
  if (imageDataUrl) {
    await addMessage({
      conversationId,
      role: "user",
      kind: "image",
      text: mediaCaption || "[imagen]",
      imageDataUrl,         // <-- el store NO lo escribe en DB
      source,
    });
  } else {
    await addMessage({
      conversationId,
      role: "user",
      kind: "text",
      text: text || (payloadId ? `[opción: ${payloadId}]` : ""),
      source,
    });
  }

  // 2) Correr el flujo
  const conversation = await getConversation(conversationId);

  // Si el bot está pausado para esta conversación, solo guardar el mensaje del usuario y salir
  if (conversation.data?.botPaused && source === "whatsapp") {
    return;
  }

  // Imágenes: tratamos como texto vacío para que el flujo pueda interpretar
  // (típicamente llegan en AWAIT_PAYMENT como comprobante)
  const flowText = imageDataUrl ? (mediaCaption || "") : text;

  const { conversation: nextConv, outgoing } = handleIncoming(
    conversation,
    flowText,
    payloadId,
    config,
  );

  // 3) (Stand-by) IA desactivada — generateAIReply devuelve null
  await generateAIReply(config, nextConv, flowText).catch(() => null);

  // 4) Guardar estado y enviar cada respuesta
  await saveConversation(nextConv);

  console.log(`[engine] ${conversationId} ${conversation.state} → ${nextConv.state} (${outgoing.length} msg)`);

  for (const out of outgoing) {
    await recordOutgoing(conversationId, out, source);
    if (source === "whatsapp") {
      const sent = await sendWhatsAppMessage(conversationId, out);
      if (!sent) console.error(`[engine] fallo envio a ${conversationId} | kind: ${out.kind}`);
    }
  }
}
