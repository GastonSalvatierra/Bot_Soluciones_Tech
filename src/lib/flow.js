// Flujo conversacional — El Rincón del Sabor (Rotisería)
// Estados: START → ASK_ORDER → CONFIRM_ORDER → ASK_DELIVERY → ASK_ADDRESS → AWAIT_PAYMENT → WAIT_CONFIRM → DONE

export const MENU_IDS = {
  VER_CARTA:   "main_carta",
  HACER_PEDIDO:"main_pedido",
  HORARIOS:    "main_horarios",
  RETIRO:      "delivery_retiro",
  DOMICILIO:   "delivery_domicilio",
  CONFIRMAR:   "confirm_si",
  MODIFICAR:   "confirm_no",
  REINICIAR:   "menu_reiniciar",
};

// ── Menú principal con botones ──────────────────────────────────
function mainMenu() {
  return {
    kind: "buttons",
    text: "¿Qué querés hacer? 👇",
    buttons: [
      { id: MENU_IDS.VER_CARTA,    title: "📋 Ver carta" },
      { id: MENU_IDS.HACER_PEDIDO, title: "🛵 Hacer pedido" },
      { id: MENU_IDS.HORARIOS,     title: "🕐 Horarios" },
    ],
  };
}

// ── Carta completa con precios propios (no Fudo) ─────────────────
function buildMenuText(config) {
  const cats = config.menuCategories || DEFAULT_MENU;
  let txt = "🍽️ *Carta — El Rincón del Sabor*\n\n";
  for (const cat of cats) {
    txt += `*${cat.name}*\n`;
    for (const item of cat.items) {
      txt += `  • ${item.name} — $${item.price.toLocaleString("es-AR")}\n`;
    }
    txt += "\n";
  }
  txt += "_Los precios incluyen IVA._";
  return txt;
}

// ── Menú por defecto (precios controlados por el operador) ───────
export const DEFAULT_MENU = [
  {
    name: "🥩 Carnes al horno",
    items: [
      { name: "Pollo entero al horno",        price: 9500 },
      { name: "Media pechuga de pollo",        price: 5000 },
      { name: "Colita de cuadril (por kg)",    price: 14000 },
      { name: "Peceto braseado (por kg)",      price: 15500 },
      { name: "Bondiola al horno (por kg)",    price: 13000 },
    ],
  },
  {
    name: "🥘 Guisos y cazuelas",
    items: [
      { name: "Guiso de lentejas (porción)",   price: 4200 },
      { name: "Guiso de mondongo (porción)",   price: 4500 },
      { name: "Locro norteño (porción)",       price: 5000 },
      { name: "Cazuela de pollo (porción)",    price: 4800 },
    ],
  },
  {
    name: "🍝 Pastas",
    items: [
      { name: "Fideos con tuco (porción)",     price: 3800 },
      { name: "Ñoquis con manteca y queso",    price: 3600 },
      { name: "Lasagna de carne (porción)",    price: 4500 },
      { name: "Canelones de verdura",          price: 4200 },
    ],
  },
  {
    name: "🥗 Ensaladas y guarniciones",
    items: [
      { name: "Ensalada rusa",                 price: 2500 },
      { name: "Puré de papas",                 price: 2000 },
      { name: "Papas al horno",                price: 2200 },
      { name: "Ensalada mixta",                price: 2000 },
    ],
  },
  {
    name: "🍰 Postres",
    items: [
      { name: "Flan casero con dulce de leche",price: 2200 },
      { name: "Budín de pan",                  price: 1800 },
      { name: "Tiramisú",                      price: 2800 },
    ],
  },
  {
    name: "🥤 Bebidas",
    items: [
      { name: "Agua mineral 500ml",            price: 1000 },
      { name: "Gaseosa lata",                  price: 1200 },
      { name: "Jugo natural",                  price: 1800 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
export function handleIncoming(conversation, incomingText, payloadId, config) {
  const conv  = { ...conversation, data: { ...conversation.data } };
  const out   = [];
  const text  = (incomingText || "").trim();
  const id    = payloadId;

  // Reinicio global
  if (
    id === MENU_IDS.REINICIAR ||
    /^(reiniciar|reset|hola|inicio|empezar|menu|menú)$/i.test(text)
  ) {
    conv.state = "START";
    conv.data  = {};
  }

  switch (conv.state) {

    // ── Bienvenida ────────────────────────────────────────────────
    case "START": {
      const biz = config.businessName || "El Rincón del Sabor";
      out.push({
        kind: "text",
        text:
          `¡Hola! 👋 Bienvenido/a a *${biz}*.\n` +
          `Soy tu asistente virtual y estoy aquí para ayudarte con tu pedido. 🍽️`,
      });
      out.push(mainMenu());
      conv.state = "MAIN_MENU";
      break;
    }

    // ── Menú principal ────────────────────────────────────────────
    case "MAIN_MENU": {
      const choice = id ?? matchMainMenu(text);

      if (choice === MENU_IDS.VER_CARTA) {
        out.push({ kind: "text", text: buildMenuText(config) });
        out.push({ kind: "text", text: "¿Querés hacer un pedido? 😊" });
        out.push(mainMenu());
        break;
      }

      if (choice === MENU_IDS.HORARIOS) {
        const hrs  = config.hours    || "Lunes a Sábado de 11:00 a 15:00 y de 19:00 a 23:00 hs.";
        const days = config.openDays || "Lunes a Sábado.";
        out.push({
          kind: "text",
          text: `🕐 *Horarios de atención:*\n${hrs}\n\n📅 *Días:* ${days}`,
        });
        out.push(mainMenu());
        break;
      }

      if (choice === MENU_IDS.HACER_PEDIDO) {
        out.push({ kind: "text", text: buildMenuText(config) });
        out.push({
          kind: "text",
          text:
            "✍️ Escribime *qué querés pedir* (podés poner varios ítems).\n\n" +
            "_Ejemplo: 1 pollo entero, 2 porciones de guiso de lentejas, 1 ensalada rusa_",
        });
        conv.state = "ASK_ORDER";
        break;
      }

      // Texto libre que no matchea
      out.push({ kind: "text", text: "No entendí esa opción 🤔" });
      out.push(mainMenu());
      break;
    }

    // ── Recibe el pedido ──────────────────────────────────────────
    case "ASK_ORDER": {
      if (!text) {
        out.push({ kind: "text", text: "Por favor escribime qué querés pedir 📝" });
        break;
      }
      conv.data.orderText = text;
      // Calcular total básico (el operador lo revisa, esto es estimativo)
      conv.data.orderTotal = estimateTotal(text, config);

      out.push({
        kind: "text",
        text:
          `📋 *Resumen de tu pedido:*\n\n${text}\n\n` +
          (conv.data.orderTotal
            ? `💰 *Total estimado: $${conv.data.orderTotal.toLocaleString("es-AR")}*\n\n`
            : "") +
          "¿Es correcto?",
      });
      out.push({
        kind: "buttons",
        text: "Confirmá tu pedido:",
        buttons: [
          { id: MENU_IDS.CONFIRMAR,  title: "✅ Sí, confirmar" },
          { id: MENU_IDS.MODIFICAR,  title: "✏️ Quiero cambiar algo" },
        ],
      });
      conv.state = "CONFIRM_ORDER";
      break;
    }

    // ── Confirma o modifica ───────────────────────────────────────
    case "CONFIRM_ORDER": {
      const choice = id ?? matchYesNo(text);

      if (choice === MENU_IDS.MODIFICAR || choice === "no") {
        out.push({ kind: "text", text: "Sin problema 😊 Escribime de nuevo qué querés pedir:" });
        out.push({ kind: "text", text: buildMenuText(config) });
        conv.state = "ASK_ORDER";
        break;
      }

      if (choice === MENU_IDS.CONFIRMAR || choice === "si") {
        out.push({
          kind: "buttons",
          text: "¿Cómo lo recibís? 🏠",
          buttons: [
            { id: MENU_IDS.RETIRO,    title: "🏪 Retiro en el local" },
            { id: MENU_IDS.DOMICILIO, title: "🛵 Envío a domicilio" },
          ],
        });
        conv.state = "ASK_DELIVERY";
        break;
      }

      out.push({ kind: "text", text: "Confirmá si el pedido está bien o querés cambiarlo:" });
      out.push({
        kind: "buttons",
        text: "¿Es correcto?",
        buttons: [
          { id: MENU_IDS.CONFIRMAR, title: "✅ Sí, confirmar" },
          { id: MENU_IDS.MODIFICAR, title: "✏️ Quiero cambiar algo" },
        ],
      });
      break;
    }

    // ── Retiro o domicilio ────────────────────────────────────────
    case "ASK_DELIVERY": {
      const choice = id ?? matchDelivery(text);

      if (choice === MENU_IDS.RETIRO) {
        conv.data.deliveryType = "retiro";
        out.push({
          kind: "text",
          text:
            `✅ *Pedido confirmado para retirar en el local.*\n\n` +
            `📍 ${config.address || "Av. Corrientes 1234, CABA"}\n\n` +
            `Tiempo estimado: *20-30 minutos* ⏱️\n\n` +
            buildPaymentMsg(conv.data, config),
        });
        conv.data.paymentRequested = true;
        conv.state = "AWAIT_PAYMENT";
        break;
      }

      if (choice === MENU_IDS.DOMICILIO) {
        conv.data.deliveryType = "domicilio";
        out.push({
          kind: "text",
          text:
            "📍 Necesito tu *dirección exacta* para coordinar el envío.\n\n" +
            "_Incluí: calle, número, piso/depto y una referencia (ej: portón azul, timbre 3B)_",
        });
        conv.state = "ASK_ADDRESS";
        break;
      }

      out.push({
        kind: "buttons",
        text: "¿Cómo lo recibís?",
        buttons: [
          { id: MENU_IDS.RETIRO,    title: "🏪 Retiro en el local" },
          { id: MENU_IDS.DOMICILIO, title: "🛵 Envío a domicilio" },
        ],
      });
      break;
    }

    // ── Pide la dirección ─────────────────────────────────────────
    case "ASK_ADDRESS": {
      if (!text || text.length < 5) {
        out.push({ kind: "text", text: "Por favor ingresá una dirección más completa 📍" });
        break;
      }
      conv.data.address = text;
      out.push({
        kind: "text",
        text:
          `✅ *Dirección registrada:* ${text}\n\n` +
          buildPaymentMsg(conv.data, config),
      });
      conv.data.paymentRequested = true;
      conv.state = "AWAIT_PAYMENT";
      break;
    }

    // ── Espera el comprobante ─────────────────────────────────────
    case "AWAIT_PAYMENT": {
      // Cualquier mensaje en este estado se interpreta como intento de envío de comprobante
      out.push({
        kind: "text",
        text:
          "⏳ *Recibimos tu mensaje.*\n\n" +
          "Estamos verificando el pago con el local. " +
          "En cuanto confirmen, te avisamos y coordinamos la entrega. " +
          "¡Gracias por tu paciencia! 🙏",
      });
      // Marcamos que hay comprobante pendiente de verificar
      conv.data.awaitingVerification = true;
      conv.state = "WAIT_CONFIRM";
      break;
    }

    // ── Esperando confirmación manual del operador ────────────────
    case "WAIT_CONFIRM": {
      out.push({
        kind: "text",
        text:
          "⏳ Tu pedido está siendo verificado por el local.\n" +
          "Te avisamos en breve. ¡Gracias! 🙏",
      });
      break;
    }

    // ── Flujo terminado ───────────────────────────────────────────
    case "DONE": {
      out.push({
        kind: "text",
        text: "¡Gracias por tu compra! 🎉 Si necesitás hacer otro pedido, escribí *Hola*.",
      });
      break;
    }

    default: {
      conv.state = "START";
      const biz = config.businessName || "El Rincón del Sabor";
      out.push({
        kind: "text",
        text: `¡Hola! 👋 Bienvenido/a a *${biz}*.`,
      });
      out.push(mainMenu());
      conv.state = "MAIN_MENU";
    }
  }

  return { conversation: conv, outgoing: out };
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function buildPaymentMsg(data, config) {
  const alias = config.paymentAlias || "rincondesabor.mp";
  const cbu   = config.paymentCBU   || "";
  const total = data.orderTotal
    ? `$${data.orderTotal.toLocaleString("es-AR")}`
    : "el monto indicado";

  let msg =
    `💳 *Método de pago — Transferencia bancaria:*\n` +
    `  • Alias: *${alias}*\n`;
  if (cbu) msg += `  • CBU: \`${cbu}\`\n`;
  msg +=
    `  • Monto: *${total}*\n\n` +
    `📸 Por favor *enviá el comprobante de transferencia* (captura de pantalla) para confirmar tu pedido.`;
  return msg;
}

function estimateTotal(orderText, config) {
  // Intenta estimar buscando cantidades y precios del menú
  const menu = config.menuCategories || DEFAULT_MENU;
  let total = 0;
  let matched = false;

  for (const cat of menu) {
    for (const item of cat.items) {
      const name  = item.name.toLowerCase();
      const words = name.split(" ").filter((w) => w.length > 3);
      const regex = new RegExp(words.slice(0, 2).join(".*"), "i");
      const match = orderText.match(regex);
      if (match) {
        // Busca cantidad antes del nombre: "2 pollo" → 2
        const qtyMatch = orderText.match(
          new RegExp(`(\\d+)\\s+${words[0]}`, "i")
        );
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
        total += item.price * qty;
        matched = true;
      }
    }
  }

  return matched ? total : null;
}

function matchMainMenu(text) {
  const t = text.toLowerCase();
  if (/cart|men[uú]|ver|precios?|lista/.test(t)) return MENU_IDS.VER_CARTA;
  if (/pedido|pedir|quiero|comprar|ordenar/.test(t))   return MENU_IDS.HACER_PEDIDO;
  if (/horario|hora|cuándo|abren|cierra/.test(t))      return MENU_IDS.HORARIOS;
  return undefined;
}

function matchYesNo(text) {
  const t = text.toLowerCase();
  if (/^s[ií]|^dale|^claro|^ok|^bueno|^confir/.test(t)) return "si";
  if (/^no|^cambi|^modifi|^otro/.test(t))               return "no";
  return undefined;
}

function matchDelivery(text) {
  const t = text.toLowerCase();
  if (/retir|busco|paso|local/.test(t))  return MENU_IDS.RETIRO;
  if (/domicilio|envio|envío|delivery|casa|mand/.test(t)) return MENU_IDS.DOMICILIO;
  return undefined;
}
