// Almacenamiento simple en archivos JSON + memoria.
// Pensado para correr local sin base de datos. Para produccion conviene
// reemplazar por una DB real (la interfaz de funciones queda igual).

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { publish } from "./events.js";

const DATA_DIR = path.join(process.cwd(), ".data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const CONVERSATIONS_FILE = path.join(DATA_DIR, "conversations.json");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");

const DEFAULT_CONFIG = {
  systemPrompt:
    "Sos el asistente virtual de la empresa. Atendes por WhatsApp de forma " +
    "cordial y breve. Guias al cliente por el menu de opciones y respondes " +
    "consultas de horarios, precios y dias de atencion. No te salis del " +
    "flujo: si el cliente escribe algo fuera de tema, lo volves a llevar al menu.",
  businessName: "Mi Negocio",
  greeting:
    "¡Hola! 👋 Bienvenido/a a *Mi Negocio*. Te voy a hacer unas preguntas para registrarte.",
  hours: "Lunes a Viernes de 9:00 a 18:00 hs.",
  openDays: "Lunes, Martes, Miercoles, Jueves y Viernes.",
  products: [
    { name: "Producto A", price: "$10.000" },
    { name: "Producto B", price: "$18.500" },
    { name: "Producto C", price: "$25.000" },
  ],
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file, fallback) {
  try {
    ensureDir();
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

/* ---------------------------- CONFIG ---------------------------- */

export function getConfig() {
  return { ...DEFAULT_CONFIG, ...readJson(CONFIG_FILE, {}) };
}

export function saveConfig(partial) {
  const next = { ...getConfig(), ...partial };
  writeJson(CONFIG_FILE, next);
  return next;
}

/* ------------------------- CONVERSATIONS ------------------------ */

function readConversations() {
  return readJson(CONVERSATIONS_FILE, {});
}

export function getConversation(id) {
  const all = readConversations();
  return all[id] ?? { id, state: "START", data: {}, updatedAt: Date.now() };
}

export function saveConversation(conv) {
  const all = readConversations();
  all[conv.id] = { ...conv, updatedAt: Date.now() };
  writeJson(CONVERSATIONS_FILE, all);
}

export function resetConversation(id) {
  const all = readConversations();
  delete all[id];
  writeJson(CONVERSATIONS_FILE, all);
}

/* --------------------------- MESSAGES --------------------------- */

export function getMessages(conversationId) {
  const all = readJson(MESSAGES_FILE, []);
  const list = conversationId
    ? all.filter((m) => m.conversationId === conversationId)
    : all;
  return list.sort((a, b) => a.createdAt - b.createdAt);
}

export function addMessage(msg) {
  const all = readJson(MESSAGES_FILE, []);
  const full = {
    ...msg,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  all.push(full);
  writeJson(MESSAGES_FILE, all);
  publish(full);
  return full;
}

export function clearAll() {
  writeJson(MESSAGES_FILE, []);
  writeJson(CONVERSATIONS_FILE, {});
}

/* ----- helper: convertir OutgoingMessage del flujo a ChatMessage ----- */

export function recordOutgoing(conversationId, out, source, role = "bot") {
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
