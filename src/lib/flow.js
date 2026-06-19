// Motor de flujo conversacional (maquina de estados).
// Es una funcion pura: recibe la conversacion + texto entrante + config y
// devuelve el nuevo estado y los mensajes a enviar.

/** IDs de los botones / filas del menu oficial. */
export const MENU_IDS = {
  HORARIOS: "menu_horarios",
  PRECIOS: "menu_precios",
  DIAS: "menu_dias",
  VOLVER: "menu_volver",
  REINICIAR: "menu_reiniciar",
  MAS_SI: "followup_si",
  MAS_NO: "followup_no",
};

function mainMenu(name) {
  const safe = name && name.trim() ? name.trim() : "";
  return {
    kind: "list",
    text: `¿En qué más te puedo ayudar, ${safe}?`.trim(),
    buttonText: "Ver opciones",
    sections: [
      {
        title: "Consultas",
        rows: [
          {
            id: MENU_IDS.HORARIOS,
            title: "🕐 Horarios",
            description: "Ver el horario de atención",
          },
          {
            id: MENU_IDS.PRECIOS,
            title: "💲 Precios",
            description: "Consultar precios de productos",
          },
          {
            id: MENU_IDS.DIAS,
            title: "📅 Días abiertos",
            description: "Qué días atendemos",
          },
        ],
      },
    ],
  };
}

/** Botones "¿Necesitás algo más?" → Sí / No, listo */
function followupButtons() {
  return {
    kind: "buttons",
    text: "¿Necesitás algo más?",
    buttons: [
      { id: MENU_IDS.MAS_SI, title: "✅ Sí, consultar más" },
      { id: MENU_IDS.MAS_NO, title: "👋 No, gracias" },
    ],
  };
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
  if (id === MENU_IDS.REINICIAR || /^(reiniciar|reset|empezar|hola|inicio)$/i.test(text)) {
    conv.state = "START";
    conv.data = {};
  }

  switch (conv.state) {
    case "START": {
      outgoing.push({ kind: "text", text: config.greeting });
      outgoing.push({ kind: "text", text: "Para empezar, ¿cuál es tu *nombre*?" });
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
        text: "Genial. Por último, tu número de *documento* (DNI).",
      });
      conv.state = "ASK_DOCUMENT";
      break;
    }

    case "ASK_DOCUMENT": {
      const digits = text.replace(/\D/g, "");
      if (digits.length < 6) {
        outgoing.push({
          kind: "text",
          text: "Ese documento no parece válido. Escribí solo números (mín. 6 dígitos).",
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
      outgoing.push(mainMenu(conv.data.name));
      conv.state = "MAIN_MENU";
      break;
    }

    case "MAIN_MENU": {
      const choice = id ?? matchTextToMenu(text);
      switch (choice) {
        case MENU_IDS.HORARIOS:
          outgoing.push({ kind: "text", text: `🕐 *Horarios de atención:*\n${config.hours}` });
          outgoing.push(followupButtons());
          conv.state = "FOLLOWUP";
          break;

        case MENU_IDS.PRECIOS: {
          const list = (config.products || [])
            .map((p) => `• ${p.name}: ${p.price}`)
            .join("\n");
          outgoing.push({
            kind: "text",
            text: `💲 *Precios:*\n${list || "Sin productos cargados."}`,
          });
          outgoing.push(followupButtons());
          conv.state = "FOLLOWUP";
          break;
        }

        case MENU_IDS.DIAS:
          outgoing.push({
            kind: "text",
            text: `📅 *Días de atención:*\n${config.openDays}`,
          });
          outgoing.push(followupButtons());
          conv.state = "FOLLOWUP";
          break;

        default:
          outgoing.push({
            kind: "text",
            text: "No entendí esa opción 🤔 Elegí una del menú:",
          });
          outgoing.push(mainMenu(conv.data.name));
      }
      break;
    }

    case "FOLLOWUP": {
      const choice = id ?? matchFollowup(text);

      if (choice === MENU_IDS.MAS_SI || choice === "si") {
        // Vuelve al menú principal
        outgoing.push(mainMenu(conv.data.name));
        conv.state = "MAIN_MENU";
      } else if (choice === MENU_IDS.MAS_NO || choice === "no") {
        // Cierra la conversación amablemente
        outgoing.push({
          kind: "text",
          text: `¡Hasta luego, ${conv.data.name || ""}! 👋 Si necesitás algo más, escribinos cuando quieras.`.trim(),
        });
        conv.state = "DONE";
      } else {
        // Respuesta no reconocida: repreguntar
        outgoing.push(followupButtons());
      }
      break;
    }

    case "DONE": {
      // Cualquier mensaje nuevo reinicia el flujo desde el menú (ya están registrados)
      outgoing.push(mainMenu(conv.data.name));
      conv.state = "MAIN_MENU";
      break;
    }

    default: {
      conv.state = "START";
      outgoing.push({ kind: "text", text: config.greeting });
      outgoing.push({ kind: "text", text: "Para empezar, ¿cuál es tu *nombre*?" });
      conv.state = "ASK_NAME";
    }
  }

  return { conversation: conv, outgoing };
}

/** Permite escribir en texto en vez de tocar el botón del menú principal. */
function matchTextToMenu(text) {
  const t = text.toLowerCase();
  if (/horari/.test(t)) return MENU_IDS.HORARIOS;
  if (/precio|cuesta|vale|sale/.test(t)) return MENU_IDS.PRECIOS;
  if (/dia|abierto|abren|atien/.test(t)) return MENU_IDS.DIAS;
  return undefined;
}

/** Permite responder "sí" / "no" en texto en el followup. */
function matchFollowup(text) {
  const t = text.toLowerCase();
  if (/^s[ií]|^sip|^dale|^claro|^obvio/.test(t)) return "si";
  if (/^no|^nop|^listo|^gracias|^chau|^bye/.test(t)) return "no";
  return undefined;
}
