"use client";

import { useEffect, useState, useCallback } from "react";

function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function phoneLabel(id) {
  if (/^\d{10,15}$/.test(id)) {
    return `+${id.slice(0, 2)} ${id.slice(2, 5)} ${id.slice(5, 9)}-${id.slice(9)}`;
  }
  return id;
}

// Deriva label y color según el estado de la conversación
function getOrderTag(conv) {
  const state = conv.state || "";
  const data  = conv.data  || {};

  if (state === "WAIT_CONFIRM" || data.awaitingVerification) {
    return { label: "⏳ Verificar pago", color: "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40" };
  }
  if (conv.botPaused) {
    return { label: "✏️ Agente", color: "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40" };
  }
  if (state === "AWAIT_PAYMENT" || data.paymentRequested) {
    return { label: "💳 Pago pendiente", color: "bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/40" };
  }
  if (state === "DONE") {
    return { label: "✅ Completado", color: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40" };
  }
  if (state === "START" || !state) {
    return null;
  }
  // En flujo activo
  return { label: "🤖 Bot activo", color: "bg-wa-green/15 text-wa-green ring-1 ring-wa-green/30" };
}

// Dot de estado
function stateColor(conv) {
  const state = conv.state || "";
  const data  = conv.data  || {};
  if (state === "WAIT_CONFIRM" || data.awaitingVerification) return "bg-amber-400 animate-pulse";
  if (conv.botPaused)            return "bg-blue-400";
  if (state === "DONE")          return "bg-emerald-500";
  if (!state || state === "START") return "bg-neutral-500";
  return "bg-wa-green";
}

// Tabs de filtro
const TABS = [
  { id: "all",     label: "Todos" },
  { id: "verify",  label: "⏳ Verificar" },
  { id: "active",  label: "🤖 Activos" },
  { id: "done",    label: "✅ Listos" },
];

function matchTab(conv, tab) {
  if (tab === "all") return true;
  const state = conv.state || "";
  const data  = conv.data  || {};
  if (tab === "verify") return state === "WAIT_CONFIRM" || !!data.awaitingVerification;
  if (tab === "active") return !["DONE","START","","WAIT_CONFIRM"].includes(state) && !data.awaitingVerification;
  if (tab === "done")   return state === "DONE";
  return true;
}

export default function ConversationList({ selectedId, onSelect }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [tab, setTab]                     = useState("all");

  const fetchConversations = useCallback(async () => {
    try {
      const res  = await fetch("/api/conversations", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data);
    } catch { /* silencioso */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const iv = setInterval(fetchConversations, 3000);
    return () => clearInterval(iv);
  }, [fetchConversations]);

  const pendingCount = conversations.filter(
    (c) => c.state === "WAIT_CONFIRM" || c.data?.awaitingVerification
  ).length;

  const filtered = conversations.filter((c) => {
    const matchSearch = c.id.toLowerCase().includes(search.toLowerCase());
    return matchSearch && matchTab(c, tab);
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header — más compacto para liberar espacio a la lista */}
      <div className="border-b border-white/8 px-3 pt-3 pb-2">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[12px] font-semibold uppercase tracking-wider text-white/40">
            Conversaciones
          </h2>
          <div className="flex items-center gap-1.5">
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-500/40 animate-pulse">
                {pendingCount} verificar
              </span>
            )}
            <span className="rounded-full bg-wa-green/20 px-2 py-0.5 text-[10px] font-semibold text-wa-green">
              {conversations.length}
            </span>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative mb-2">
          <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar contacto…"
            className="w-full rounded-xl bg-white/6 py-1.5 pl-9 pr-3 text-[13px] text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-wa-green/40"
          />
        </div>

        {/* Tabs de filtro — flex-wrap para que se vean todos sin scroll horizontal */}
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
                tab === t.id
                  ? "bg-wa-green/20 text-wa-green ring-1 ring-wa-green/30"
                  : "bg-white/5 text-white/45 hover:text-white/75 hover:bg-white/8"
              }`}
            >
              {t.label}
              {t.id === "verify" && pendingCount > 0 && (
                <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-black">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lista — items más compactos para dejar más al filtro de arriba */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-[60px] animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-2 px-4 text-center">
            <span className="text-3xl">💬</span>
            <p className="text-sm text-white/40">
              {search ? "Sin resultados" : tab !== "all" ? "Ninguna en esta categoría" : "Aún no hay conversaciones"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 p-1.5">
            {filtered.map((conv) => {
              const isSelected = conv.id === selectedId;
              const tag        = getOrderTag(conv);
              const lastText   = conv.lastMessage?.text || "";
              const preview    = lastText.length > 36 ? lastText.slice(0, 36) + "…" : lastText || "Sin mensajes";
              const needsVerify = conv.state === "WAIT_CONFIRM" || conv.data?.awaitingVerification;

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all ${
                    isSelected
                      ? "bg-wa-green/15 ring-1 ring-wa-green/30"
                      : needsVerify
                      ? "bg-amber-500/5 hover:bg-amber-500/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-sm font-semibold text-white/60">
                      {conv.id === "demo" ? "🧪" : conv.id.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-wa-panel ${stateColor(conv)}`}
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="truncate text-[13px] font-semibold text-white/90">
                        {phoneLabel(conv.id)}
                      </span>
                      <span className="flex-shrink-0 text-[10px] text-white/30">
                        {timeAgo(conv.updatedAt)}
                      </span>
                    </div>

                    {tag && (
                      <span className={`mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-tight ${tag.color}`}>
                        {tag.label}
                      </span>
                    )}

                    <p className="mt-0.5 truncate text-[11.5px] leading-snug text-white/40">
                      {conv.lastMessage?.role === "user" ? "" : "🤖 "}
                      {preview}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
