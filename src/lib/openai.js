// Cliente de OpenAI -- EN STAND-BY.
// La arquitectura ya esta lista: cuando pongas AI_ENABLED=true y cargues la
// OPENAI_API_KEY, podras llamar a generateAIReply() desde el flujo para que
// la IA responda usando el systemPrompt autoadministrado desde la interfaz.
//
// Por ahora devuelve null para que el bot use el flujo guiado por menus.

import OpenAI from "openai";

const AI_ENABLED = process.env.AI_ENABLED === "true";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

let client = null;

function getClient() {
  if (!AI_ENABLED || !process.env.OPENAI_API_KEY) return null;
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export function isAIEnabled() {
  return AI_ENABLED && Boolean(process.env.OPENAI_API_KEY);
}

/**
 * Genera una respuesta con IA usando el prompt configurado.
 * Devuelve null si la IA esta en stand-by (cae al flujo por menus).
 */
export async function generateAIReply(config, conversation, userText) {
  const openai = getClient();
  if (!openai) return null;

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: config.systemPrompt },
        {
          role: "system",
          content:
            `Datos del cliente: ${JSON.stringify(conversation.data)}. ` +
            `Negocio: ${config.businessName}. Horarios: ${config.hours}. ` +
            `Dias: ${config.openDays}.`,
        },
        { role: "user", content: userText },
      ],
    });
    return completion.choices[0]?.message?.content ?? null;
  } catch (err) {
    console.error("OpenAI error:", err);
    return null;
  }
}
