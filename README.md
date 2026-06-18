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