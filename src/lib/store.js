// Almacenamiento con Supabase.
// Reemplaza la versión anterior (JSON local / RAM).
//
// Variables de entorno requeridas:
//   SUPABASE_URL        → Settings → API → Project URL
//   SUPABASE_SERVICE_KEY → Settings → API → service_role (secret)

import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import { publish } from "./events.js";

// Cliente "perezoso": se crea recién la primera vez que se necesita,
// no al importar el módulo. Esto evita que `npm run build` falle si
// las env vars todavía no están seteadas (por ejemplo en Vercel antes
// de configurarlas, o si falta el .env.local en desarrollo).
let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      "[store] Faltan SUPABASE_URL y/o SUPABASE_SERVICE_KEY. " +
      "Creá un .env.local con esos valores (ver .env.example).",
    );
  }

  _supabase = createClient(url, key);
  return _supabase;
}

const DEFAULT_CONFIG = {
  systemPrompt:
    "Sos el asistente virtual de El Rincón del Sabor, una rotisería. " +
    "Atendés por WhatsApp de forma cordial y breve. Guiás al cliente para hacer pedidos, " +
    "les mostrás la carta, les pedís dirección si es a domicilio y les informás cómo pagar. " +
    "No te salís del flujo.",
  businessName: "El Rincón del Sabor",
  greeting:
    "¡Hola! 👋 Bienvenido/a a *El Rincón del Sabor*. ¿En qué te puedo ayudar hoy?",
  hours: "Lunes a Sábado de 11:00 a 15:00 y de 19:00 a 23:00 hs.",
  openDays: "Lunes a Domingo.",
  address: "Av. Rivadavia 4521, CABA",
  paymentAlias: "rincondesabor.mp",
  paymentCBU: "",
  products: [
    { name: "Pollo entero al horno", price: "$9.500" },
    { name: "Colita de cuadril (x kg)", price: "$14.000" },
    { name: "Guiso de lentejas", price: "$4.200" },
    { name: "Lasagna de carne", price: "$4.500" },
    { name: "Flan casero", price: "$2.200" },
  ],
};

/* ================================================================
   CONFIG
   ================================================================ */

export async function getConfig() {
  const { data, error } = await getSupabase()
    .from("config")
    .select("data")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    console.error("[store] getConfig error:", error.message);
    return { ...DEFAULT_CONFIG };
  }

  return { ...DEFAULT_CONFIG, ...(data?.data ?? {}) };
}

export async function saveConfig(partial) {
  const current = await getConfig();
  const next = { ...current, ...partial };

  const { error } = await getSupabase()
    .from("config")
    .upsert({ id: "default", data: next, updated_at: new Date().toISOString() });

  if (error) console.error("[store] saveConfig error:", error.message);
  return next;
}

/* ================================================================
   CONVERSATIONS
   ================================================================ */

export async function getConversation(id) {
  const { data, error } = await getSupabase()
    .from("conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[store] getConversation error:", error.message);
  }

  return data
    ? { id: data.id, state: data.state, data: data.data ?? {} }
    : { id, state: "START", data: {} };
}

export async function saveConversation(conv) {
  const { error } = await getSupabase().from("conversations").upsert({
    id: conv.id,
    state: conv.state,
    data: conv.data ?? {},
    updated_at: new Date().toISOString(),
  });

  if (error) console.error("[store] saveConversation error:", error.message);
}

export async function resetConversation(id) {
  const { error } = await getSupabase()
    .from("conversations")
    .delete()
    .eq("id", id);

  if (error) console.error("[store] resetConversation error:", error.message);
}

/* ================================================================
   MESSAGES
   ================================================================ */

export async function getMessages(conversationId) {
  let query = getSupabase()
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (conversationId) {
    query = query.eq("conversation_id", conversationId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[store] getMessages error:", error.message);
    return [];
  }

  // Devolver en el mismo formato que esperan los componentes
  return (data ?? []).map(rowToMessage);
}

export async function addMessage(msg) {
  const id = crypto.randomUUID();
  const createdAt = Date.now();

  // Separar campos "extra" (buttons, list) del resto
  const { buttons, list, ...base } = msg;
  const extra = {};
  if (buttons) extra.buttons = buttons;
  if (list) extra.list = list;

  const row = {
    id,
    conversation_id: msg.conversationId,
    role: msg.role,
    kind: msg.kind,
    text: msg.text ?? null,
    extra: Object.keys(extra).length ? extra : null,
    source: msg.source ?? null,
    created_at: new Date(createdAt).toISOString(),
  };

  const { error } = await getSupabase().from("messages").insert(row);

  if (error) console.error("[store] addMessage error:", error.message);

  const full = { ...msg, id, createdAt };
  publish(full);
  return full;
}

// Solo limpia la conversación del simulador ("demo").
// NUNCA toca conversaciones reales de WhatsApp.
export async function clearAll(conversationId = "demo") {
  await getSupabase().from("messages").delete().eq("conversation_id", conversationId);
  await getSupabase().from("conversations").delete().eq("id", conversationId);
}

/* ================================================================
   HELPER: recordOutgoing (sin cambios de API)
   ================================================================ */

export async function recordOutgoing(conversationId, out, source, role = "bot") {
  if (out.kind === "buttons") {
    return addMessage({
      conversationId,
      role,
      kind: "buttons",
      text: out.text,
      buttons: out.buttons,
      source,
    });
  }
  if (out.kind === "list") {
    return addMessage({
      conversationId,
      role,
      kind: "list",
      text: out.text,
      list: { buttonText: out.buttonText, sections: out.sections },
      source,
    });
  }
  return addMessage({
    conversationId,
    role,
    kind: "text",
    text: out.text,
    source,
  });
}

/* ================================================================
   INTERNO: convertir fila de Supabase → formato que usa la app
   ================================================================ */

function rowToMessage(row) {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    kind: row.kind,
    text: row.text ?? "",
    buttons: row.extra?.buttons ?? undefined,
    list: row.extra?.list ?? undefined,
    source: row.source ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
  };
}