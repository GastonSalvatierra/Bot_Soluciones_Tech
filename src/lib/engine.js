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
 * @param {object} input { conversationId, text, payloadId, source }
 */
export async function processIncoming(input) {
  // Normalizar el número ANTES de usarlo como clave — corrige el bug del "9" argentino:
  // Meta manda "5491126661234" en el webhook, pero la Cloud API espera "541126661234"
  // al enviar. Al normalizar acá, ambas operaciones usan el mismo ID.
  const conversationId =
    input.source === "whatsapp"
      ? normalizePhone(input.conversationId)
      : input.conversationId;

  const { text, payloadId, source } = input;
  const config = await getConfig();

  console.log(`[engine] ← mensaje de ${conversationId} (${source}) | text="${text}" | payloadId="${payloadId}"`);

  // 1) Registrar el mensaje del usuario
  await addMessage({
    conversationId,
    role: "user",
    kind: "text",
    text: text || (payloadId ? `[opción: ${payloadId}]` : ""),
    source,
  });

  // 2) Correr el flujo
  const conversation = await getConversation(conversationId);
  console.log(`[engine] estado actual: ${conversation.state}`);

  const { conversation: nextConv, outgoing } = handleIncoming(
    conversation,
    text,
    payloadId,
    config,
  );

  console.log(`[engine] estado siguiente: ${nextConv.state} | mensajes a enviar: ${outgoing.length}`);

  // 3) (Stand-by) IA desactivada — generateAIReply devuelve null
  await generateAIReply(config, nextConv, text).catch(() => null);

  // 4) Guardar estado y enviar cada respuesta
  await saveConversation(nextConv);

  for (const out of outgoing) {
    await recordOutgoing(conversationId, out, source);
    const sent = await sendWhatsAppMessage(conversationId, out);
    if (source === "whatsapp") {
      console.log(`[engine] → ${out.kind} enviado a WhatsApp: ${sent}`);
    }
  }
}