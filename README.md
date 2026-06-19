# 🟢 WhatsApp Menu Bot (JavaScript)

Bot para el **menú oficial de WhatsApp** (Cloud API de Meta) con un flujo guiado
que mantiene al cliente "en una sola línea": registro (nombre → apellido →
documento) y luego un menú con tarjetas oficiales para consultar **horarios,
precios y días de atención**.

- ✅ Pantalla de **mensajes en tiempo real** (enviados y recibidos) vía SSE.
- ✅ **Editor de prompt autoadministrable** + datos del negocio (horarios, días,
  productos) editables desde la interfaz, sin tocar código.
- ✅ **Tarjetas interactivas oficiales** de WhatsApp (botones y listas).
- ✅ **Simulador local** para probar el flujo completo sin tener WhatsApp
  conectado.
- ✅ **OpenAI ya cableado en stand-by**: la arquitectura está lista; sólo falta
  activar la variable y poner la API key cuando quieras.

Construido con **Next.js 15 (App Router)** + **Tailwind CSS v4** en
**JavaScript puro** (sin TypeScript).

---

## 🚀 Cómo correrlo en tu local

Requisitos: **Node.js 18.18+** (recomendado 20+).

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de entorno
cp .env.example .env

# 3. Levantar en modo desarrollo
npm run dev
```

Abrí 👉 **http://localhost:3000**

Vas a ver el panel dividido en dos columnas:
- **Izquierda:** chat en tiempo real + simulador (escribí "Hola" para arrancar el flujo).
- **Derecha:** configuración (prompt, horarios, días, productos).

> El simulador funciona aunque NO tengas WhatsApp conectado. Los mensajes se
> guardan en `.data/` (archivos JSON) y se muestran en pantalla.

---

## 🤖 Activar la IA de OpenAI (cuando quieras)

Hoy está en **stand-by** a propósito. Para activarla:

1. En `.env` poné:
   ```env
   AI_ENABLED=true
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini   # podés cambiar el modelo cuando lo decidas
   ```
2. Listo. `src/lib/openai.js` ya tiene todo. Para que la IA responda en lugar
   del flujo por menús, llamá a `generateAIReply()` desde `src/lib/engine.js`
   (hay un comentario que marca exactamente dónde).

El **prompt** que se usa es el que cargás desde la interfaz (pestaña
Configuración). Se guarda solo.

---

## 📲 Conectar WhatsApp Cloud API (Meta) en producción

1. Creá una app en [Meta for Developers](https://developers.facebook.com/) y
   habilitá **WhatsApp**.
2. Completá en `.env`:
   ```env
   WHATSAPP_VERIFY_TOKEN=algo_secreto_que_vos_elegis
   WHATSAPP_ACCESS_TOKEN=tu_access_token
   WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
   WHATSAPP_GRAPH_VERSION=v21.0
   ```
3. Configurá el **webhook** en el panel de Meta apuntando a:
   ```
   https://TU-DOMINIO/api/webhook
   ```
   usando el mismo `WHATSAPP_VERIFY_TOKEN`. Suscribite al campo `messages`.
4. ¡Listo! Los mensajes reales entran por `/api/webhook`, el bot responde con
   las tarjetas oficiales y todo se ve en la pantalla en tiempo real.

> Para exponer tu local a internet durante pruebas podés usar `ngrok`:
> `ngrok http 3000` y usar esa URL como webhook.

---

## 🗂️ Estructura del proyecto

```
src/
  app/
    api/
      webhook/route.js    # verificación (GET) + recepción de mensajes (POST)
      messages/route.js   # historial + stream SSE en tiempo real
      config/route.js     # leer/guardar configuración (prompt + negocio)
      simulate/route.js   # simulador local de mensajes entrantes
      reset/route.js      # limpiar mensajes/conversaciones
    page.jsx              # panel de control (chat + config)
    layout.jsx
  components/
    LiveChat.jsx          # pantalla de mensajes en tiempo real
    Composer.jsx          # caja para enviar mensajes (simulador)
    PromptConfig.jsx      # editor de prompt y datos del negocio
  lib/
    flow.js               # máquina de estados del flujo conversacional
    engine.js             # orquestador (une flujo + store + envío)
    whatsapp.js           # cliente Cloud API (tarjetas oficiales)
    openai.js             # cliente OpenAI (stand-by)
    store.js              # persistencia en JSON + memoria
    events.js             # bus de eventos para el tiempo real (SSE)
```

---

## ✏️ Cambiar el flujo

Toda la lógica del flujo está en **`src/lib/flow.js`**. Es una función pura, así
que es fácil de extender (agregar pasos, opciones de menú, validaciones, etc.).
Las respuestas "fake" (horarios, precios, días) salen de la configuración que
editás desde la interfaz.

---

Hecho para que **sólo cambies el prompt desde la interfaz** y todo lo demás se
autoadministre. 🚀



-----------


1157658730764954 - Phone Number ID

1394270722530090 - WABA ID

-------Token Temporal--------
EAAM9BXipjAcBRqSRqpRn7T5E0vgcZCSwumSjmP17vAZCYONN9SkBZAqD421ZCkMot7uZCbXby7WggxPXTaxpXmLQj00uGgVHth6azcEq1DvoGpJRbvsZCiARmDZCWtZABaoCPq8A5UNxLKH9NBfq4M7KYBE2PYBKjyRIdVUrzBowMbtsURAHWcggL1hiOvnebxE1gjS5VfWP5JlHNh9j53MejrAMgI5arGXcqWFwb4CoyySTd5i7Ieq3dRKYftDCEjKeICQC4wZBinZBbjWUkgufLPlyJO
-------Token Temporal--------

cb3692ecbc411d07ab3b161422beecdd - Clave secreta de la aplicación
Clave secreta de la aplicación



------------------------------

engine.js

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



----------------------------

flow

// Motor de flujo conversacional (maquina de estados).
// Es una funcion pura: recibe la conversacion + texto entrante + config y
// devuelve el nuevo estado y los mensajes a enviar. La usan tanto el webhook
// real de WhatsApp como el simulador interno.

/** IDs de los botones / filas del menu oficial. */
export const MENU_IDS = {
  HORARIOS: "menu_horarios",
  PRECIOS: "menu_precios",
  DIAS: "menu_dias",
  VOLVER: "menu_volver",
  REINICIAR: "menu_reiniciar",
};

function mainMenu() {
  return {
    kind: "list",
    text: "Genial 🙌 ¿En que te puedo ayudar, {nombre}?",
    buttonText: "Ver opciones",
    sections: [
      {
        title: "Consultas",
        rows: [
          {
            id: MENU_IDS.HORARIOS,
            title: "🕐 Horarios",
            description: "Ver el horario de atencion",
          },
          {
            id: MENU_IDS.PRECIOS,
            title: "💲 Precios",
            description: "Consultar precios de productos",
          },
          {
            id: MENU_IDS.DIAS,
            title: "📅 Dias abiertos",
            description: "Que dias atendemos",
          },
        ],
      },
    ],
  };
}

function backButtons() {
  return {
    kind: "buttons",
    text: "¿Necesitas algo mas?",
    buttons: [
      { id: MENU_IDS.VOLVER, title: "🔙 Volver al menu" },
      { id: MENU_IDS.REINICIAR, title: "♻️ Reiniciar" },
    ],
  };
}

function withName(msg, name) {
  const safe = name && name.trim() ? name.trim() : "";
  return { ...msg, text: msg.text.replace("{nombre}", safe).replace("  ", " ") };
}

/**
 * Procesa un mensaje entrante.
 * @param {object} conversation  estado actual de la conversacion
 * @param {string} incomingText  texto plano o titulo del boton presionado
 * @param {string|undefined} payloadId  id del boton/fila interactiva (si aplica)
 * @param {object} config  configuracion del negocio
 */
export function handleIncoming(conversation, incomingText, payloadId, config) {
  const conv = { ...conversation, data: { ...conversation.data } };
  const outgoing = [];
  const text = (incomingText || "").trim();
  const id = payloadId;

  // Reinicio global desde cualquier punto.
  if (id === MENU_IDS.REINICIAR || /^(reiniciar|reset|empezar)$/i.test(text)) {
    conv.state = "START";
    conv.data = {};
  }

  switch (conv.state) {
    case "START": {
      outgoing.push({ kind: "text", text: config.greeting });
      outgoing.push({ kind: "text", text: "Para empezar, ¿cual es tu *nombre*?" });
      conv.state = "ASK_NAME";
      break;
    }

    case "ASK_NAME": {
      if (!text) {
        outgoing.push({ kind: "text", text: "Por favor escribime tu *nombre* 🙂" });
        break;
      }
      conv.data.name = text;
      outgoing.push({
        kind: "text",
        text: `Perfecto, ${text}. Ahora decime tu *apellido*.`,
      });
      conv.state = "ASK_LASTNAME";
      break;
    }

    case "ASK_LASTNAME": {
      if (!text) {
        outgoing.push({ kind: "text", text: "Necesito tu *apellido* para continuar." });
        break;
      }
      conv.data.lastName = text;
      outgoing.push({
        kind: "text",
        text: "Genial. Por ultimo, tu numero de *documento* (DNI).",
      });
      conv.state = "ASK_DOCUMENT";
      break;
    }

    case "ASK_DOCUMENT": {
      const digits = text.replace(/\D/g, "");
      if (digits.length < 6) {
        outgoing.push({
          kind: "text",
          text: "Ese documento no parece valido. Escribi solo numeros (min. 6 digitos).",
        });
        break;
      }
      conv.data.document = digits;
      outgoing.push({
        kind: "text",
        text:
          `✅ ¡Registro completo!\n\n` +
          `*Nombre:* ${conv.data.name}\n` +
          `*Apellido:* ${conv.data.lastName}\n` +
          `*Documento:* ${conv.data.document}`,
      });
      outgoing.push(withName(mainMenu(), conv.data.name));
      conv.state = "MAIN_MENU";
      break;
    }

    case "MAIN_MENU": {
      const choice = id ?? matchTextToMenu(text);
      switch (choice) {
        case MENU_IDS.HORARIOS:
          outgoing.push({ kind: "text", text: `🕐 *Horarios:*\n${config.hours}` });
          outgoing.push(backButtons());
          break;
        case MENU_IDS.PRECIOS: {
          const list = config.products
            .map((p) => `• ${p.name}: ${p.price}`)
            .join("\n");
          outgoing.push({
            kind: "text",
            text: `💲 *Precios:*\n${list || "Sin productos cargados."}`,
          });
          outgoing.push(backButtons());
          break;
        }
        case MENU_IDS.DIAS:
          outgoing.push({
            kind: "text",
            text: `📅 *Dias de atencion:*\n${config.openDays}`,
          });
          outgoing.push(backButtons());
          break;
        case MENU_IDS.VOLVER:
          outgoing.push(withName(mainMenu(), conv.data.name));
          break;
        default:
          outgoing.push({
            kind: "text",
            text: "No entendi esa opcion 🤔 Elegi una del menu:",
          });
          outgoing.push(withName(mainMenu(), conv.data.name));
      }
      break;
    }

    default: {
      conv.state = "START";
      outgoing.push({ kind: "text", text: config.greeting });
      outgoing.push({ kind: "text", text: "Para empezar, ¿cual es tu *nombre*?" });
      conv.state = "ASK_NAME";
    }
  }

  return { conversation: conv, outgoing };
}

/** Permite que el cliente escriba en texto en vez de tocar el boton. */
function matchTextToMenu(text) {
  const t = text.toLowerCase();
  if (/horari/.test(t)) return MENU_IDS.HORARIOS;
  if (/precio|cuesta|vale|sale/.test(t)) return MENU_IDS.PRECIOS;
  if (/dia|abierto|abren|atien/.test(t)) return MENU_IDS.DIAS;
  if (/volver|menu|atras/.test(t)) return MENU_IDS.VOLVER;
  return undefined;
}


------------------------

store

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
