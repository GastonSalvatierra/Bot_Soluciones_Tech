// Cliente de WhatsApp Cloud API (Meta).
// Convierte los mensajes del flujo en payloads oficiales y los envia.
// Si no hay credenciales configuradas, NO falla: solo registra los mensajes
// en el store para que se vean en la pantalla (modo local / stand-by).

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v21.0";
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";

export function isWhatsAppConfigured() {
  return Boolean(PHONE_ID && ACCESS_TOKEN);
}

function buildPayload(to, msg) {
  const base = { messaging_product: "whatsapp", to };

  if (msg.kind === "text") {
    return { ...base, type: "text", text: { body: msg.text } };
  }

  if (msg.kind === "buttons") {
    return {
      ...base,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: msg.text },
        action: {
          buttons: msg.buttons.slice(0, 3).map((b) => ({
            type: "reply",
            reply: { id: b.id, title: b.title.slice(0, 20) },
          })),
        },
      },
    };
  }

  // list
  return {
    ...base,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: msg.text },
      action: {
        button: msg.buttonText.slice(0, 20),
        sections: msg.sections.map((s) => ({
          title: s.title.slice(0, 24),
          rows: s.rows.map((r) => ({
            id: r.id,
            title: r.title.slice(0, 24),
            description: r.description ? r.description.slice(0, 72) : undefined,
          })),
        })),
      },
    },
  };
}

/**
 * Envia un mensaje a traves de la Cloud API.
 * Devuelve true si se envio realmente; false si esta en modo local.
 */
export async function sendWhatsAppMessage(to, msg) {
  if (!isWhatsAppConfigured()) return false;

  // 🛠️ LIMPIEZA CLAVE PARA ARGENTINA: Quitar el "9" si viene de celular (54911... -> 5411...)
  let cleanTo = to.replace(/\D/g, ""); // Borra cualquier espacio o guión por las dudas
  if (cleanTo.startsWith("549")) {
    cleanTo = "54" + cleanTo.slice(3);
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_ID}/messages`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      // Usamos el número limpio acá 👇
      body: JSON.stringify(buildPayload(cleanTo, msg)),
    });
    
    if (!res.ok) {
      // 🚨 Esto nos va a escupir en los logs de Vercel por qué rebota exactamente si llega a fallar
      console.error("WhatsApp API error:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("WhatsApp API fetch failed:", err);
    return false;
  }
}
