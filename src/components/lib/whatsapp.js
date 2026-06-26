// Cliente de WhatsApp Cloud API (Meta).
// Convierte los mensajes del flujo en payloads oficiales y los envía.
// Si no hay credenciales configuradas, NO falla: solo registra en el store
// para que se vea en la pantalla (modo local / stand-by).

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v21.0";
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";

export function isWhatsAppConfigured() {
  return Boolean(PHONE_ID && ACCESS_TOKEN);
}

/**
 * Normaliza números argentinos para la API de Meta.
 *
 * Meta espera el número SIN el "9" de celular que agrega Argentina:
 *   54 9 11 XXXX-XXXX  →  5411XXXXXXXX
 *   54 9 XXX XXXX-XXXX →  54XXXXXXXXXX
 *
 * El webhook de Meta manda el número sin "+" ni espacios: "5491126661234"
 */
export function normalizePhone(raw) {
  if (!raw) return "";
  let n = String(raw).replace(/\D/g, "");
  if (n.startsWith("549")) {
    n = "54" + n.slice(3);
  }
  return n;
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
 * Envía un mensaje a través de la Cloud API.
 * Devuelve true si se envió; false si está en modo local o falló.
 */
export async function sendWhatsAppMessage(to, msg) {
  if (!isWhatsAppConfigured()) return false;

  const cleanTo = normalizePhone(to);

  if (!cleanTo) {
    console.error("[whatsapp] 'to' vacío después de normalizar — abortando.");
    return false;
  }

  const payload = buildPayload(cleanTo, msg);
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_ID}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[whatsapp] Error ${res.status} → ${cleanTo}:`, body);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[whatsapp] fetch falló:", err);
    return false;
  }
}