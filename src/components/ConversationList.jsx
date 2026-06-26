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

function stateColor(state) {
  if (!state || state === "START") return "bg-neutral-500";
  if (state === "DONE" || state === "END") return "bg-emerald-500";
  return "bg-wa-green";
}

function phoneLabel(id) {
  // Si es un número de teléfono, lo formatea mejor
  if (/^\d{10,15}$/.test(id)) {
    return `+${id.slice(0, 2)} ${id.slice(2, 5)} ${id.slice(5, 9)}-${id.slice(9)}`;
  }
  return id;
}

export default function ConversationList({ selectedId, onSelect }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const filtered = conversations.filter((c) =>
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-white/8 px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-white/40">
            Conversaciones
          </h2>
          <span className="rounded-full bg-wa-green/20 px-2 py-0.5 text-[11px] font-semibold text-wa-green">
            {conversations.length}
          </span>
        </div>
        {/* Buscador */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar contacto…"
            className="w-full rounded-xl bg-white/6 py-2 pl-9 pr-3 text-[13px] text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-wa-green/40"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-[64px] animate-pulse rounded-xl bg-white/5"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-2 px-4 text-center">
            <span className="text-3xl">💬</span>
            <p className="text-sm text-white/40">
              {search ? "Sin resultados" : "Aún no hay conversaciones"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 p-2">
            {filtered.map((conv) => {
              const isSelected = conv.id === selectedId;
              const lastText = conv.lastMessage?.text || "";
              const preview =
                lastText.length > 42
                  ? lastText.slice(0, 42) + "…"
                  : lastText || "Sin mensajes";

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                    isSelected
                      ? "bg-wa-green/15 ring-1 ring-wa-green/30"
                      : "hover:bg-white/5"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-base font-semibold text-white/60">
                      {conv.id === "demo"
                        ? "🧪"
                        : conv.id.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-wa-panel ${stateColor(conv.state)}`}
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="truncate text-[13px] font-semibold text-white/90">
                        {phoneLabel(conv.id)}
                      </span>
                      <span className="flex-shrink-0 text-[11px] text-white/30">
                        {timeAgo(conv.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] leading-relaxed text-white/40">
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
