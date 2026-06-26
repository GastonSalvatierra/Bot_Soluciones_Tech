"use client";

import { useEffect, useRef, useState, useCallback } from "react";

function renderText(text) {
  return text.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");
}

function Bubble({ msg }) {
  const isUser = msg.role === "user";
  const isAgent = msg.source === "agent";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow ${
          isUser
            ? "bg-wa-bubble-user text-white rounded-br-sm"
            : isAgent
            ? "bg-[oklch(0.30_0.04_250)] text-white rounded-bl-sm ring-1 ring-white/10"
            : "bg-wa-bubble-bot text-neutral-900 rounded-bl-sm"
        }`}
      >
        {isAgent && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
            Agente
          </p>
        )}
        <p
          className="whitespace-pre-wrap leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderText(msg.text || "") }}
        />

        {msg.kind === "buttons" && msg.buttons && (
          <div className="mt-2 flex flex-col gap-1">
            {msg.buttons.map((b) => (
              <div
                key={b.id}
                className="rounded-lg border border-wa-green/30 bg-white px-3 py-1.5 text-center text-sm font-medium text-wa-green-dark opacity-70"
              >
                {b.title}
              </div>
            ))}
          </div>
        )}

        {msg.kind === "list" && msg.list && (
          <div className="mt-2 space-y-2">
            {msg.list.sections.map((s, i) => (
              <div key={i}>
                {s.title && (
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {s.title}
                  </p>
                )}
                <div className="flex flex-col gap-1">
                  {s.rows.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 opacity-70"
                    >
                      <span className="block text-sm font-medium text-neutral-800">
                        {r.title}
                      </span>
                      {r.description && (
                        <span className="block text-xs text-neutral-500">
                          {r.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-1 flex items-center justify-end gap-1">
          <p className={`text-[10px] ${isUser ? "text-white/70" : isAgent ? "text-white/40" : "text-neutral-400"}`}>
            {new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function phoneLabel(id) {
  if (/^\d{10,15}$/.test(id)) {
    return `+${id.slice(0, 2)} ${id.slice(2, 5)} ${id.slice(5, 9)}-${id.slice(9)}`;
  }
  return id;
}

// Toggle visual bot on/off
function BotToggle({ botPaused, onChange, loading }) {
  return (
    <button
      onClick={() => onChange(!botPaused)}
      disabled={loading}
      title={botPaused ? "Bot pausado — clic para reactivar" : "Bot activo — clic para pausar"}
      className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all ${
        botPaused
          ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30 hover:bg-amber-500/25"
          : "bg-wa-green/15 text-wa-green ring-1 ring-wa-green/30 hover:bg-wa-green/25"
      } disabled:opacity-50`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          botPaused ? "bg-amber-400" : "bg-wa-green animate-pulse"
        }`}
      />
      {loading ? "…" : botPaused ? "Bot pausado" : "Bot activo"}
    </button>
  );
}

export default function ChatViewer({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [botPaused, setBotPaused] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const seenIds = useRef(new Set());
  const pollingRef = useRef(null);

  // Fetch bot state cuando cambia la conversación
  useEffect(() => {
    if (!conversationId) return;
    fetch(`/api/bot-toggle?conversationId=${encodeURIComponent(conversationId)}`)
      .then((r) => r.json())
      .then((d) => setBotPaused(Boolean(d.botPaused)))
      .catch(() => {});
  }, [conversationId]);

  const handleToggle = async (pause) => {
    setToggleLoading(true);
    try {
      const res = await fetch("/api/bot-toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, botPaused: pause }),
      });
      const data = await res.json();
      if (data.ok) setBotPaused(data.botPaused);
    } finally {
      setToggleLoading(false);
    }
  };

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await fetch(
        `/api/messages?conversationId=${encodeURIComponent(conversationId)}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      const newMsgs = data.filter((m) => !seenIds.current.has(m.id));
      if (newMsgs.length > 0) {
        newMsgs.forEach((m) => seenIds.current.add(m.id));
        setMessages((prev) => [...prev, ...newMsgs]);
      }
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    setMessages([]);
    seenIds.current = new Set();
    setLoading(true);
    setText("");
    clearInterval(pollingRef.current);

    if (conversationId) {
      fetchMessages();
      pollingRef.current = setInterval(fetchMessages, 2000);
    }
    return () => clearInterval(pollingRef.current);
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendManual = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setText("");
    try {
      await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, text: value }),
      });
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  if (!conversationId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-3xl">
          💬
        </div>
        <p className="text-sm text-white/40">
          Seleccioná una conversación para ver el historial
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-white/8 px-4 py-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-wa-green/20 text-base font-bold text-wa-green">
          {conversationId.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-white/90">
            {phoneLabel(conversationId)}
          </p>
          <p className="text-[11px] text-white/35">{messages.length} mensajes</p>
        </div>

        {/* Toggle bot */}
        <BotToggle
          botPaused={botPaused}
          onChange={handleToggle}
          loading={toggleLoading}
        />
      </div>

      {/* Banner cuando bot está pausado */}
      {botPaused && (
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-amber-500/20 bg-amber-500/8 px-4 py-2">
          <span className="text-sm">✏️</span>
          <p className="text-[12px] text-amber-300/80">
            Modo agente activo — el bot no responderá mientras estés escribiendo
          </p>
        </div>
      )}

      {/* Mensajes */}
      <div className="chat-pattern flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="mt-10 text-center text-sm text-white/40">Cargando mensajes…</p>
        ) : messages.length === 0 ? (
          <p className="mt-10 text-center text-sm text-white/40">
            Esta conversación no tiene mensajes aún.
          </p>
        ) : (
          messages.map((m) => <Bubble key={m.id} msg={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer — solo visible cuando bot está pausado */}
      {botPaused ? (
        <div className="flex-shrink-0 border-t border-white/8 bg-wa-panel p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendManual();
                }
              }}
              rows={1}
              placeholder="Escribí tu respuesta…"
              className="max-h-32 flex-1 resize-none rounded-2xl bg-white/8 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />
            <button
              onClick={sendManual}
              disabled={sending || !text.trim()}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-white transition hover:bg-amber-400 disabled:opacity-40"
              aria-label="Enviar"
            >
              ➤
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-white/20">
            Enter para enviar · Shift+Enter nueva línea · se envía por WhatsApp
          </p>
        </div>
      ) : (
        <div className="flex-shrink-0 border-t border-white/8 bg-wa-panel px-4 py-3">
          <p className="text-center text-[11px] text-white/20">
            El bot responde automáticamente · pausalo para tomar control
          </p>
        </div>
      )}
    </div>
  );
}
