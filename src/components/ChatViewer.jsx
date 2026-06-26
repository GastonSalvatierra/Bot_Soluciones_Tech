"use client";

import { useEffect, useRef, useState, useCallback } from "react";

function renderText(text) {
  return text.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");
}

function Bubble({ msg }) {
  const isUser = msg.role === "user";
  const isBot = msg.role === "bot";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow ${
          isUser
            ? "bg-wa-bubble-user text-white rounded-br-sm"
            : "bg-wa-bubble-bot text-neutral-900 rounded-bl-sm"
        }`}
      >
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

        <div className="mt-1 flex items-center justify-end gap-1.5">
          {msg.source && (
            <span className="text-[10px] opacity-40">
              {msg.source === "whatsapp" ? "📱" : "🧪"}
            </span>
          )}
          <p
            className={`text-[10px] ${
              isUser ? "text-white/70" : "text-neutral-400"
            }`}
          >
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

export default function ChatViewer({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const seenIds = useRef(new Set());
  const pollingRef = useRef(null);

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
      {/* Header del chat */}
      <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-wa-green/20 text-base font-bold text-wa-green">
          {conversationId === "demo"
            ? "🧪"
            : conversationId.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-white/90">
            {phoneLabel(conversationId)}
          </p>
          <p className="text-[11px] text-white/35">
            {messages.length} mensajes · solo lectura
          </p>
        </div>
        {/* Badge "WhatsApp real" */}
        {conversationId !== "demo" && (
          <span className="flex-shrink-0 rounded-full bg-wa-green/15 px-2 py-0.5 text-[11px] font-semibold text-wa-green">
            📱 WA real
          </span>
        )}
      </div>

      {/* Mensajes */}
      <div className="chat-pattern flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="mt-10 text-center text-sm text-white/40">
            Cargando mensajes…
          </p>
        ) : messages.length === 0 ? (
          <p className="mt-10 text-center text-sm text-white/40">
            Esta conversación no tiene mensajes aún.
          </p>
        ) : (
          messages.map((m) => <Bubble key={m.id} msg={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer informativo — no permite enviar */}
      <div className="border-t border-white/8 bg-wa-panel px-4 py-3">
        <p className="text-center text-[11px] text-white/25">
          Vista de solo lectura · las respuestas las maneja el bot automáticamente
        </p>
      </div>
    </div>
  );
}
