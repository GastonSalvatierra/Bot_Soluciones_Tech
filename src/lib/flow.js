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
