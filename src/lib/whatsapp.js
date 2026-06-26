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

// Trunca con elipsis preservando el límite real (idéntico al de flow.js)
function clip(str, n) {
  const s = String(str ?? "");
  if (s.length <= n) return s;
  return s.slice(0, Math.max(0, n - 1)).trimEnd() + "…";
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
            reply: { id: b.id, title: clip(b.title, 20) },
          })),
        },
      },
    };
  }

  // list — WhatsApp permite hasta 10 secciones y 10 filas por sección.
  // Limitamos ambos por seguridad y truncamos textos con elipsis.
  const sections = (msg.sections || []).slice(0, 10).map((s) => ({
    title: clip(s.title, 24),
    rows: (s.rows || []).slice(0, 10).map((r) => ({
      id: r.id,
      title: clip(r.title, 24),
      description: r.description ? clip(r.description, 72) : undefined,
    })),
  }));

  return {
    ...base,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: msg.text },
      action: {
        button: clip(msg.buttonText, 20),
        sections,
      },
    },
  };
}

/**
 * Envía un mensaje a través de la Cloud API.
 * Devuelve true si se envió; false si está en modo local o falló.
 */
export async function sendWhatsAppMessage(to, msg) {
  if (!isWhatsAppConfigured()) {
    console.log("[whatsapp] Sin credenciales — modo local, no se envía.");
    return false;
  }

  const cleanTo = normalizePhone(to);

  if (!cleanTo) {
    console.error("[whatsapp] 'to' está vacío después de normalizar — abortando envío.");
    return false;
  }

  const payload = buildPayload(cleanTo, msg);
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_ID}/messages`;

  console.log(`[whatsapp] → enviando a ${cleanTo} | tipo: ${msg.kind}`);

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
      console.error("[whatsapp] payload que falló:", JSON.stringify(payload));
      return false;
    }

    return true;
  } catch (err) {
    console.error("[whatsapp] fetch falló:", err);
    return false;
  }
}

/**
 * Descarga un media (imagen, audio, doc) de WhatsApp Cloud API.
 * Devuelve un data URL base64 listo para mostrar en <img src=...>.
 * NO persiste nada en disco ni en DB — sólo retorna el data URL.
 */
export async function fetchWhatsAppMediaAsDataUrl(mediaId) {
  if (!ACCESS_TOKEN) {
    console.warn("[whatsapp] fetchMedia: sin ACCESS_TOKEN, no se puede descargar.");
    return null;
  }
  if (!mediaId) return null;

  try {
    // 1) Pedir la URL temporal del media
    const metaRes = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${mediaId}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });
    if (!metaRes.ok) {
      console.error(`[whatsapp] fetchMedia meta ${metaRes.status}:`, await metaRes.text());
      return null;
    }
    const meta = await metaRes.json();
    const url      = meta.url;
    const mimeType = meta.mime_type || "image/jpeg";
    if (!url) return null;

    // 2) Descargar el binario con el mismo token
    const binRes = await fetch(url, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });
    if (!binRes.ok) {
      console.error(`[whatsapp] fetchMedia bin ${binRes.status}`);
      return null;
    }
    const ab = await binRes.arrayBuffer();
    const b64 = Buffer.from(ab).toString("base64");
    return `data:${mimeType};base64,${b64}`;
  } catch (err) {
    console.error("[whatsapp] fetchMedia error:", err);
    return null;
  }
}
