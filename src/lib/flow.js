// Flujo conversacional — El Rincón del Sabor
// Sistema de pedidos con menú interactivo por botones/listas para total 100% exacto.

export const MENU_IDS = {
  VER_CARTA:    "main_carta",
  HACER_PEDIDO: "main_pedido",
  HORARIOS:     "main_horarios",
  RETIRO:       "delivery_retiro",
  DOMICILIO:    "delivery_domicilio",
  CONFIRMAR:    "confirm_si",
  MODIFICAR:    "confirm_no",
  AGREGAR_MAS:  "order_mas",
  TERMINAR:     "order_listo",
  REINICIAR:    "menu_reiniciar",
};

// ── Catálogo completo con IDs únicos ──────────────────────────────
export const CATALOGO = [
  {
    id: "cat_promos",
    name: "🎉 Promociones",
    items: [
      { id: "p01", name: "Sand. mila super completo + fritas + gaseosa chica", price: 22000 },
      { id: "p02", name: "Sand. lomito super completo + fritas + gaseosa chica", price: 28000 },
      { id: "p03", name: "Hamburguesa super completa + fritas + gaseosa chica", price: 18000 },
      { id: "p04", name: "Choripán + fritas + gaseosa chica", price: 12000 },
      { id: "p05", name: "2 Muzzarella + gaseosa grande", price: 27000 },
      { id: "p06", name: "Jamón y Morrones + Muzzarella + 2 Fainas", price: 30000 },
      { id: "p07", name: "Napolitana + Fugazza", price: 26000 },
      { id: "p08", name: "Roquefort + Muzzarella + 2 Fainas", price: 30000 },
      { id: "p09", name: "Muzzarella + 6 empanadas a elección", price: 25000 },
      { id: "p10", name: "Mila napolitana con fritas + gaseosa chica", price: 21000 },
      { id: "p11", name: "6 Empanadas a elección + gaseosa chica", price: 15000 },
      { id: "p12", name: "12 Empanadas a elección + Muzzarella", price: 36000 },
      { id: "p13", name: "Calabreza + Muzzarella", price: 29000 },
      { id: "p14", name: "Muzzarella + gaseosa grande", price: 15000 },
      { id: "p15", name: "Pollo entero con fritas", price: 30000 },
      { id: "p16", name: "2 Muzzarella + lata a elección", price: 24000 },
      { id: "p17", name: "Sand. Bondiola + fritas + gaseosa 500ml", price: 20000 },
    ],
  },
  {
    id: "cat_menu",
    name: "📋 Menú del día",
    items: [
      { id: "m01", name: "Menú del día", price: 12000 },
      { id: "m02", name: "Menú nocturno", price: 13000 },
      { id: "m03", name: "Plato especial c/ guarnición", price: 16000 },
      { id: "m04", name: "Pechuga grille con guarnición", price: 16000 },
      { id: "m05", name: "Pechuga grille sola", price: 13000 },
      { id: "m06", name: "Bife ancho con guarnición", price: 16000 },
      { id: "m07", name: "Ravioles/Ñoquis con bolognesa", price: 16000 },
      { id: "m08", name: "Pastas con salsa filetto", price: 15000 },
    ],
  },
  {
    id: "cat_milas",
    name: "🥩 Milanesas",
    items: [
      { id: "ml01", name: "Milanesa c/ guarnición", price: 16000 },
      { id: "ml02", name: "Milanesa a caballo con fritas", price: 18000 },
      { id: "ml03", name: "Napo c/ guarnición", price: 18000 },
      { id: "ml04", name: "Sand. de mila super completo", price: 20000 },
      { id: "ml05", name: "Sand. de mila de cerdo super completo", price: 15000 },
      { id: "ml06", name: "Sand. mila super completo sin fritas", price: 18000 },
      { id: "ml07", name: "Sand. mila sola", price: 13000 },
    ],
  },
  {
    id: "cat_pizza_ch",
    name: "🍕 Pizzas Chicas",
    items: [
      { id: "pc01", name: "Muzzarella chica", price: 9000 },
      { id: "pc02", name: "Napolitana chica", price: 10000 },
      { id: "pc03", name: "Jamón y Morrones chica", price: 12000 },
      { id: "pc04", name: "Roquefort chica", price: 13000 },
      { id: "pc05", name: "Calabreza chica", price: 12000 },
      { id: "pc06", name: "Fugazza chica", price: 9000 },
      { id: "pc07", name: "Fugazzeta chica", price: 11000 },
      { id: "pc08", name: "Fugazzeta al jamón chica", price: 15000 },
      { id: "pc09", name: "Fugazzeta rellena con jamón chica", price: 15000 },
      { id: "pc10", name: "Palmitos chica", price: 12000 },
      { id: "pc11", name: "Primavera chica", price: 12000 },
      { id: "pc12", name: "Anchoas chica", price: 12000 },
      { id: "pc13", name: "Muzza con jamón chica", price: 10000 },
    ],
  },
  {
    id: "cat_pizza_gr",
    name: "🍕 Pizzas Grandes",
    items: [
      { id: "pg01", name: "Muzzarella grande", price: 12000 },
      { id: "pg02", name: "Napolitana grande", price: 14000 },
      { id: "pg03", name: "Jamón y Morrón grande", price: 17000 },
      { id: "pg04", name: "Roquefort grande", price: 17000 },
      { id: "pg05", name: "Calabreza grande", price: 18000 },
      { id: "pg06", name: "Fugazza grande", price: 14000 },
      { id: "pg07", name: "Fugazzeta grande", price: 16000 },
      { id: "pg08", name: "Fugazzeta rellena con jamón grande", price: 22000 },
      { id: "pg09", name: "Palmitos grande", price: 19000 },
      { id: "pg10", name: "Primavera grande", price: 17000 },
      { id: "pg11", name: "Anchoas grande", price: 18000 },
      { id: "pg12", name: "Muzza con jamón grande", price: 14000 },
    ],
  },
  {
    id: "cat_empanadas",
    name: "🫔 Empanadas",
    items: [
      { id: "e01", name: "Empanada de carne", price: 2200 },
      { id: "e02", name: "Empanada de pollo", price: 2200 },
      { id: "e03", name: "Empanada jamón y queso", price: 2200 },
      { id: "e04", name: "Empanada norteña", price: 2200 },
      { id: "e05", name: "Docena (a elección)", price: 26000 },
      { id: "e06", name: "Docena norteñas", price: 26000 },
    ],
  },
  {
    id: "cat_sandwiches",
    name: "🥖 Sandwiches",
    items: [
      { id: "s01", name: "Lomito c/ fritas", price: 16000 },
      { id: "s02", name: "Lomito completo sin fritas", price: 19000 },
      { id: "s03", name: "Vacío c/ fritas", price: 16000 },
      { id: "s04", name: "Bondiola c/ fritas", price: 16000 },
      { id: "s05", name: "Choripán con fritas", price: 10000 },
      { id: "s06", name: "Hamburguesa super completa c/ fritas", price: 15000 },
      { id: "s07", name: "Sand. mila con lechuga y tomate", price: 15000 },
      { id: "s08", name: "Sand. mila super completa con fritas", price: 20000 },
    ],
  },
  {
    id: "cat_guarniciones",
    name: "🍟 Guarniciones",
    items: [
      { id: "g01", name: "Porción de fritas grande", price: 5000 },
      { id: "g02", name: "Porción de fritas chica", price: 3000 },
      { id: "g03", name: "Puré de calabaza/papa", price: 5000 },
      { id: "g04", name: "Ensalada porción", price: 6000 },
      { id: "g05", name: "Ensalada", price: 4000 },
      { id: "g06", name: "Porción tarta", price: 5000 },
      { id: "g07", name: "Tortilla de verdura", price: 11000 },
      { id: "g08", name: "Tortilla de papa", price: 11000 },
      { id: "g09", name: "Faina", price: 1300 },
    ],
  },
  {
    id: "cat_adicionales",
    name: "➕ Adicionales",
    items: [
      { id: "a01", name: "Extra jamón", price: 1000 },
      { id: "a02", name: "Extra queso", price: 1000 },
      { id: "a03", name: "Huevo frito", price: 2000 },
      { id: "a04", name: "Lechuga y tomate", price: 1000 },
    ],
  },
  {
    id: "cat_bebidas",
    name: "🥤 Bebidas",
    items: [
      { id: "b01", name: "Agua chica", price: 2000 },
      { id: "b02", name: "Agua grande", price: 3000 },
      { id: "b03", name: "Gaseosa chica", price: 3000 },
      { id: "b04", name: "Gaseosa grande", price: 5000 },
      { id: "b05", name: "Coca Cola grande", price: 6000 },
      { id: "b06", name: "Gaseosa coreana", price: 3000 },
      { id: "b07", name: "Bebida coreana", price: 8000 },
      { id: "b08", name: "Jugo saborizado", price: 1000 },
      { id: "b09", name: "Brahma lata", price: 2500 },
      { id: "b10", name: "Quilmes lata", price: 2500 },
      { id: "b11", name: "Andes Rubia lata", price: 3500 },
      { id: "b12", name: "Andes Negra lata", price: 2500 },
      { id: "b13", name: "Stella Artois lata", price: 3500 },
      { id: "b14", name: "Heineken lata", price: 3500 },
      { id: "b15", name: "Corona chica", price: 4000 },
      { id: "b16", name: "Speed", price: 3000 },
      { id: "b17", name: "Red Bull", price: 3000 },
      { id: "b18", name: "Brahma botella", price: 5000 },
      { id: "b19", name: "Quilmes botella", price: 5000 },
      { id: "b20", name: "Stella Artois botella", price: 6000 },
      { id: "b21", name: "Heineken botella", price: 6000 },
      { id: "b22", name: "Promo gaseosa coreana x4", price: 10000 },
    ],
  },
];

// ── Mapa rápido id → item ─────────────────────────────────────────
const ITEM_MAP = {};
for (const cat of CATALOGO) {
  for (const item of cat.items) {
    ITEM_MAP[item.id] = item;
  }
}

// ── IDs de categorías para navegación ────────────────────────────
const CAT_IDS = CATALOGO.map((c) => c.id);

// ── Límites WhatsApp Cloud API (interactive list) ────────────────
// title fila: 24, description fila: 72, title sección: 24,
// máx 10 filas por sección, máx 10 secciones por lista.
const WA_TITLE_MAX = 24;
const WA_DESC_MAX  = 72;
const WA_ROWS_PER_SECTION = 10;

// Trunca con elipsis preservando el límite real
function clip(str, n) {
  const s = String(str ?? "");
  if (s.length <= n) return s;
  return s.slice(0, Math.max(0, n - 1)).trimEnd() + "…";
}

// Construye {title, description} respetando los límites
// title corto + nombre completo + precio en description (si entran)
function rowFromItem(item) {
  const priceStr = `$${item.price.toLocaleString("es-AR")}`;
  const fullName = item.name;
  const isLong   = fullName.length > WA_TITLE_MAX;

  const title = isLong ? clip(fullName, WA_TITLE_MAX) : fullName;
  // Si el title quedó truncado, ponemos el nombre completo + precio en description.
  // Si no, description = precio.
  const description = isLong
    ? clip(`${fullName} — ${priceStr}`, WA_DESC_MAX)
    : priceStr;

  return { id: item.id, title, description };
}

// ── Helpers UI ───────────────────────────────────────────────────

function mainMenu() {
  return {
    kind: "buttons",
    text: "¿Qué necesitás? 👇",
    buttons: [
      { id: MENU_IDS.HACER_PEDIDO, title: "🛒 Hacer pedido" },
      { id: MENU_IDS.VER_CARTA,    title: "📋 Ver carta" },
      { id: MENU_IDS.HORARIOS,     title: "🕐 Horarios" },
    ],
  };
}

function categoryMenu() {
  return {
    kind: "list",
    text: "¿Qué querés pedir? Elegí una categoría 👇",
    buttonText: "Ver categorías",
    sections: [
      {
        title: "Categorías",
        rows: CATALOGO.map((c) => ({
          id: c.id,
          title: clip(c.name, WA_TITLE_MAX),
          description: clip(`${c.items.length} opciones`, WA_DESC_MAX),
        })),
      },
    ],
  };
}

// Paginación de productos: si una categoría tiene más de 10 ítems,
// los partimos en secciones de hasta 10. Mantiene una sección final con
// navegación. WhatsApp permite hasta 10 secciones por lista (=100 ítems).
function itemsMenu(catId) {
  const cat = CATALOGO.find((c) => c.id === catId);
  if (!cat) return categoryMenu();

  const items = cat.items;
  const groups = Math.max(1, Math.ceil(items.length / WA_ROWS_PER_SECTION));

  const sections = [];
  for (let i = 0; i < groups; i++) {
    const slice = items.slice(i * WA_ROWS_PER_SECTION, (i + 1) * WA_ROWS_PER_SECTION);
    const sectionTitle = groups > 1
      ? clip(`${cat.name} ${i + 1}/${groups}`, WA_TITLE_MAX)
      : clip(cat.name, WA_TITLE_MAX);
    sections.push({
      title: sectionTitle,
      rows: slice.map(rowFromItem),
    });
  }

  // Sección de navegación al final (cuenta como 1 sección extra)
  sections.push({
    title: "Navegación",
    rows: [{ id: "nav_back_cats", title: "⬅️ Volver a categorías", description: "" }],
  });

  return {
    kind: "list",
    text: `${cat.name} — Elegí un producto:`,
    buttonText: "Ver productos",
    sections,
  };
}

function qtyMenu(itemId) {
  const item = ITEM_MAP[itemId];
  if (!item) return categoryMenu();
  const backCatId = CATALOGO.find(c => c.items.some(i => i.id === itemId))?.id;
  return {
    kind: "list",
    text: `*${item.name}* — $${item.price.toLocaleString("es-AR")}\n\n¿Cuántas unidades?`,
    buttonText: "Elegir cantidad",
    sections: [
      {
        title: "Cantidad",
        rows: [1, 2, 3, 4, 5, 6].map((n) => ({
          id: `qty_${n}_${itemId}`,
          title: clip(`${n} unidad${n > 1 ? "es" : ""}`, WA_TITLE_MAX),
          description: clip(`Subtotal: $${(item.price * n).toLocaleString("es-AR")}`, WA_DESC_MAX),
        })),
      },
      {
        title: "Volver",
        rows: [{ id: `nav_back_cat_${backCatId}`, title: "⬅️ Volver a la categoría", description: "" }],
      },
    ],
  };
}

function orderSummary(items) {
  if (!items || items.length === 0) return "_(sin productos aún)_";
  let txt = "";
  for (const line of items) {
    txt += `  • ${line.qty}x ${line.name} — $${(line.price * line.qty).toLocaleString("es-AR")}\n`;
  }
  const total = items.reduce((s, l) => s + l.price * l.qty, 0);
  txt += `\n💰 *Total: $${total.toLocaleString("es-AR")}*`;
  return txt;
}

function addMoreOrFinishButtons() {
  return {
    kind: "buttons",
    text: "¿Querés agregar algo más a tu pedido?",
    buttons: [
      { id: MENU_IDS.AGREGAR_MAS, title: "➕ Agregar más" },
      { id: MENU_IDS.TERMINAR,    title: "✅ Listo, confirmar" },
    ],
  };
}

function buildPaymentMsg(data, config) {
  const alias = config.paymentAlias || "rincondesabor.mp";
  const cbu   = config.paymentCBU   || "";
  const items = data.orderItems || [];
  const total = items.reduce((s, l) => s + l.price * l.qty, 0);

  let msg =
    `💳 *Método de pago — Transferencia:*\n` +
    `  • Alias: *${alias}*\n`;
  if (cbu) msg += `  • CBU: \`${cbu}\`\n`;
  msg +=
    `  • Monto exacto: *$${total.toLocaleString("es-AR")}*\n\n` +
    `📸 *Enviá el comprobante de transferencia* (captura de pantalla) para confirmar tu pedido.\n` +
    `⏳ Verificaremos el pago y te avisamos en breve.`;
  return msg;
}

// ── Motor de estados ──────────────────────────────────────────────

export function handleIncoming(conversation, incomingText, payloadId, config) {
  const conv = { ...conversation, data: { ...conversation.data } };
  if (!conv.data.orderItems) conv.data.orderItems = [];

  const out  = [];
  const text = (incomingText || "").trim();
  const id   = payloadId;

  // Reinicio global
  if (
    id === MENU_IDS.REINICIAR ||
    /^(reiniciar|reset|hola|inicio|empezar|menu|menú)$/i.test(text)
  ) {
    conv.state = "START";
    conv.data  = { orderItems: [] };
  }

  switch (conv.state) {

    // ── Bienvenida ─────────────────────────────────────────────────
    case "START": {
      const biz = config.businessName || "El Rincón del Sabor";
      out.push({
        kind: "text",
        text:
          `¡Hola! 👋 Bienvenido/a a *${biz}*.\n` +
          `Soy tu asistente y te ayudo con tu pedido. 🍽️`,
      });
      out.push(mainMenu());
      conv.state = "MAIN_MENU";
      break;
    }

    // ── Menú principal ─────────────────────────────────────────────
    case "MAIN_MENU": {
      const choice = id ?? matchMainMenu(text);

      if (choice === MENU_IDS.VER_CARTA) {
        // Carta completa en texto
        let carta = "🍽️ *Carta — El Rincón del Sabor*\n\n";
        for (const cat of CATALOGO) {
          carta += `*${cat.name}*\n`;
          for (const item of cat.items) {
            carta += `  • ${item.name} — $${item.price.toLocaleString("es-AR")}\n`;
          }
          carta += "\n";
        }
        carta += "_Precios en pesos argentinos._";
        out.push({ kind: "text", text: carta });
        out.push({ kind: "text", text: "¿Hacemos un pedido? 😊" });
        out.push(mainMenu());
        break;
      }

      if (choice === MENU_IDS.HORARIOS) {
        const hrs  = config.hours    || "Lunes a Sábado de 12:00 a 15:00 y de 20:00 a 23:00 hs.";
        const days = config.openDays || "Lunes a Domingo.";
        out.push({
          kind: "text",
          text:
            `🕐 *Horarios de atención:*\n${hrs}\n\n` +
            `📅 *Días:* ${days}\n\n` +
            `📍 *Dirección:* ${config.address || "caracas 602"}\n` +
            `📞 *Tel:* 1166263667`,
        });
        out.push(mainMenu());
        break;
      }

      if (choice === MENU_IDS.HACER_PEDIDO) {
        conv.data.orderItems = [];
        out.push({ kind: "text", text: "¡Perfecto! 🛒 Elegí la categoría que te interesa:" });
        out.push(categoryMenu());
        conv.state = "PICK_CATEGORY";
        break;
      }

      out.push({ kind: "text", text: "Elegí una opción del menú 👇" });
      out.push(mainMenu());
      break;
    }

    // ── Elige categoría ────────────────────────────────────────────
    case "PICK_CATEGORY": {
      if (id === "nav_back_cats" || matchMainMenu(text) === MENU_IDS.HACER_PEDIDO) {
        out.push(categoryMenu());
        break;
      }

      // Volver al menú principal
      if (id === MENU_IDS.REINICIAR || /^(cancelar|salir|menu|menú)$/i.test(text)) {
        out.push(mainMenu());
        conv.state = "MAIN_MENU";
        break;
      }

      const cat = CATALOGO.find((c) => c.id === id);
      if (cat) {
        conv.data.currentCat = id;
        out.push(itemsMenu(id));
        conv.state = "PICK_ITEM";
        break;
      }

      out.push({ kind: "text", text: "Por favor elegí una categoría de la lista 👇" });
      out.push(categoryMenu());
      break;
    }

    // ── Elige ítem ─────────────────────────────────────────────────
    case "PICK_ITEM": {
      // Volver a categorías
      if (id === "nav_back_cats") {
        out.push(categoryMenu());
        conv.state = "PICK_CATEGORY";
        break;
      }
      if (id && id.startsWith("nav_back_cat_")) {
        const backCat = id.replace("nav_back_cat_", "");
        out.push(itemsMenu(backCat));
        conv.state = "PICK_ITEM";
        break;
      }

      const item = ITEM_MAP[id];
      if (item) {
        conv.data.pendingItemId = id;
        out.push(qtyMenu(id));
        conv.state = "PICK_QTY";
        break;
      }

      // Texto: podría estar eligiendo categoría nueva
      const cat = CATALOGO.find((c) => c.id === id);
      if (cat) {
        conv.data.currentCat = id;
        out.push(itemsMenu(id));
        break;
      }

      out.push({ kind: "text", text: "Por favor elegí un producto de la lista 👇" });
      out.push(itemsMenu(conv.data.currentCat || CATALOGO[0].id));
      break;
    }

    // ── Elige cantidad ─────────────────────────────────────────────
    case "PICK_QTY": {
      // Volver
      if (id === "nav_back_cats") {
        out.push(categoryMenu());
        conv.state = "PICK_CATEGORY";
        break;
      }
      if (id && id.startsWith("nav_back_cat_")) {
        const backCat = id.replace("nav_back_cat_", "");
        out.push(itemsMenu(backCat));
        conv.state = "PICK_ITEM";
        break;
      }

      // qty_{n}_{itemId}
      if (id && id.startsWith("qty_")) {
        const parts  = id.split("_"); // ["qty","n","itemId..."]
        const qty    = parseInt(parts[1], 10);
        const itemId = parts.slice(2).join("_");
        const item   = ITEM_MAP[itemId];

        if (item && qty > 0) {
          // Agregar o acumular en la lista
          const existing = conv.data.orderItems.find((l) => l.id === itemId);
          if (existing) {
            existing.qty += qty;
          } else {
            conv.data.orderItems.push({ id: itemId, name: item.name, price: item.price, qty });
          }
          delete conv.data.pendingItemId;

          out.push({
            kind: "text",
            text:
              `✅ Agregado: *${qty}x ${item.name}*\n\n` +
              `📋 *Tu pedido hasta ahora:*\n${orderSummary(conv.data.orderItems)}`,
          });
          out.push(addMoreOrFinishButtons());
          conv.state = "ORDER_ONGOING";
          break;
        }
      }

      out.push({ kind: "text", text: "Por favor elegí la cantidad 👇" });
      out.push(qtyMenu(conv.data.pendingItemId));
      break;
    }

    // ── ¿Agregar más o confirmar? ──────────────────────────────────
    case "ORDER_ONGOING": {
      const choice = id ?? matchAddOrFinish(text);

      if (choice === MENU_IDS.AGREGAR_MAS || choice === "mas") {
        out.push({ kind: "text", text: "¿Qué más querés agregar?" });
        out.push(categoryMenu());
        conv.state = "PICK_CATEGORY";
        break;
      }

      if (choice === MENU_IDS.TERMINAR || choice === "listo") {
        // Resumen final + preguntar retiro/domicilio
        out.push({
          kind: "text",
          text:
            `📋 *Resumen de tu pedido:*\n\n${orderSummary(conv.data.orderItems)}\n\n` +
            `¿Cómo lo recibís?`,
        });
        out.push({
          kind: "buttons",
          text: "¿Retirás o te lo llevamos?",
          buttons: [
            { id: MENU_IDS.RETIRO,    title: "🏪 Retiro en el local" },
            { id: MENU_IDS.DOMICILIO, title: "🛵 Envío a domicilio" },
          ],
        });
        conv.state = "ASK_DELIVERY";
        break;
      }

      out.push(addMoreOrFinishButtons());
      break;
    }

    // ── Retiro o domicilio ─────────────────────────────────────────
    case "ASK_DELIVERY": {
      const choice = id ?? matchDelivery(text);

      if (choice === MENU_IDS.RETIRO) {
        conv.data.deliveryType = "retiro";
        const addr = config.address || "caracas 602";
        out.push({
          kind: "text",
          text:
            `✅ *Pedido para retirar en el local.*\n` +
            `📍 ${addr}\n` +
            `⏱️ Tiempo estimado: *20-30 min*\n\n` +
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
            "📍 *¿Cuál es tu dirección?*\n\n" +
            "Escribí: _calle, número, piso/depto y una referencia_\n" +
            "_Ejemplo: Av. Corrientes 1234, 3° B, portón verde_",
        });
        conv.state = "ASK_ADDRESS";
        break;
      }

      out.push({
        kind: "buttons",
        text: "¿Cómo recibís el pedido?",
        buttons: [
          { id: MENU_IDS.RETIRO,    title: "🏪 Retiro en el local" },
          { id: MENU_IDS.DOMICILIO, title: "🛵 Envío a domicilio" },
        ],
      });
      break;
    }

    // ── Pide dirección ─────────────────────────────────────────────
    case "ASK_ADDRESS": {
      if (!text || text.length < 6) {
        out.push({
          kind: "text",
          text: "Necesito una dirección más completa 📍\n_Calle, número, piso/depto y referencia_",
        });
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

    // ── Espera comprobante ─────────────────────────────────────────
    case "AWAIT_PAYMENT": {
      out.push({
        kind: "text",
        text:
          "⏳ *Recibimos tu mensaje.*\n\n" +
          "Estamos verificando el pago con el local. " +
          "¡Gracias por tu paciencia! 🙏\n\n" +
          "_En cuanto confirmemos, te avisamos y coordinamos la entrega._",
      });
      conv.data.awaitingVerification = true;
      conv.state = "WAIT_CONFIRM";
      break;
    }

    // ── Esperando confirmación del operador ────────────────────────
    case "WAIT_CONFIRM": {
      out.push({
        kind: "text",
        text:
          "⏳ Tu pedido ya está siendo verificado por el local.\n" +
          "Te avisamos en breve. ¡Gracias! 🙏",
      });
      break;
    }

    // ── Finalizado ─────────────────────────────────────────────────
    case "DONE": {
      out.push({
        kind: "text",
        text: "¡Gracias por tu compra! 🎉 Si querés hacer otro pedido, escribí *Hola*.",
      });
      break;
    }

    default: {
      conv.state = "START";
      const biz = config.businessName || "El Rincón del Sabor";
      out.push({ kind: "text", text: `¡Hola! 👋 Bienvenido/a a *${biz}*.` });
      out.push(mainMenu());
      conv.state = "MAIN_MENU";
    }
  }

  return { conversation: conv, outgoing: out };
}

// ── Matchers de texto libre ───────────────────────────────────────

function matchMainMenu(text) {
  const t = text.toLowerCase();
  if (/cart|men[uú]|ver|precios?|lista/.test(t))          return MENU_IDS.VER_CARTA;
  if (/pedido|pedir|quiero|comprar|ordenar|order/.test(t)) return MENU_IDS.HACER_PEDIDO;
  if (/horario|hora|cu[aá]ndo|abren|cierra|direcci/.test(t)) return MENU_IDS.HORARIOS;
  return undefined;
}

function matchAddOrFinish(text) {
  const t = text.toLowerCase();
  if (/m[aá]s|otro|agreg|sumar|a[ñn]adir/.test(t)) return "mas";
  if (/listo|finaliz|confirm|termino|ya est[aá]|no m[aá]s|eso es todo/.test(t)) return "listo";
  return undefined;
}

function matchDelivery(text) {
  const t = text.toLowerCase();
  if (/retir|busco|paso|local|voy/.test(t))              return MENU_IDS.RETIRO;
  if (/domicilio|envi|delivery|casa|mand|traer/.test(t)) return MENU_IDS.DOMICILIO;
  return undefined;
}
