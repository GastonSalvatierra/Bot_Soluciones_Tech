// Orquestador central: recibe un mensaje entrante (de WhatsApp o del simulador),
// lo registra, corre el flujo, guarda la conversacion, registra y envia las
// respuestas. Es el unico lugar que une todas las piezas.

import { handleIncoming } from "./flow.js";
import { generateAIReply } from "./openai.js";
import {
  addMessage,
  getConfig,
  getConversation,
  recordOutgoing,
  saveConversation,
} from "./store.js";
import { sendWhatsAppMessage } from "./whatsapp.js";

/**
 * @param {object} input { conversationId, text, payloadId, source }
 */
export async function processIncoming(input) {
  const { conversationId, text, payloadId, source } = input;
  const config = getConfig();

  // 1) Registrar el mensaje del usuario (para que se vea en la pantalla).
  addMessage({
    conversationId,
    role: "user",
    kind: "text",
    text: text || (payloadId ? `[opcion: ${payloadId}]` : ""),
    source,
  });

  // 2) Correr el flujo.
  const conversation = getConversation(conversationId);
  const { conversation: nextConv, outgoing } = handleIncoming(
    conversation,
    text,
    payloadId,
    config,
  );

  // 3) (Opcional / stand-by) Si la IA estuviera activa podria intervenir aca.
  //    Hoy generateAIReply devuelve null, asi que usamos el flujo por menus.
  await generateAIReply(config, nextConv, text).catch(() => null);

  // 4) Guardar estado y enviar/registrar cada respuesta.
  saveConversation(nextConv);
  for (const out of outgoing) {
    recordOutgoing(conversationId, out, source);
    await sendWhatsAppMessage(conversationId, out);
  }
}
