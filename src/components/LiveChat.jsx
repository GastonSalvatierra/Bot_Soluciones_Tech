"use client";

import { useEffect, useRef, useState, useCallback } from "react";

function renderText(text) {
  return text
    .replace(/\*([^*]+)\*/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code class='bg-black/20 rounded px-1 text-[11px]'>$1</code>");
}

function Bubble({ msg, onAction }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-1.5 px-2`}>
      <div
        className={`relative max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
          isUser
            ? "bg-[#005c4b] text-white rounded-br-[4px]"
            : "bg-[#202c33] text-[#e9edef] rounded-bl-[4px]"
        }`}
      >
        {/* Tail */}
        <span
          className={`absolute top-0 w-3 h-3 overflow-hidden ${
            isUser ? "-right-2" : "-left-2"
          }`}
          style={{ display: "none" }}
        />

        {msg.kind === "image" && msg.imageDataUrl && (
          <img
            src={msg.imageDataUrl}
            alt="Imagen recibida"
            className="mb-1 max-h-72 w-auto max-w-full rounded-lg object-contain"
          />
        )}
        {msg.kind === "image" && !msg.imageDataUrl && (
          <p className="mb-1 text-[11px] italic opacity-60">
            🖼️ Imagen no disponible (no persistida)
          </p>
        )}
        {msg.kind === "image" && msg.text && msg.text !== "[imagen]" && msg.text !== "[imagen recibida]" && (
          <p
            className="whitespace-pre-wrap leading-relaxed text-[13.5px] mt-1"
            dangerouslySetInnerHTML={{ __html: renderText(msg.text) }}
          />
        )}

        {msg.kind === "text" && (
          <p
            className="whitespace-pre-wrap leading-relaxed text-[13.5px]"
            dangerouslySetInnerHTML={{ __html: renderText(msg.text || "") }}
          />
        )}

        {msg.kind === "buttons" && (
          <>
            {msg.text && (
              <p
                className="whitespace-pre-wrap leading-relaxed text-[13.5px] mb-2"
                dangerouslySetInnerHTML={{ __html: renderText(msg.text) }}
              />
            )}
            <div className="flex flex-col gap-1.5 mt-1">
              {(msg.buttons || []).map((b) => (
                <button
                  key={b.id}
                  onClick={() => onAction(b.title, b.id)}
                  className="w-full rounded-xl border border-[#00a884]/40 bg-[#00a884]/10 px-3 py-2 text-center text-[13px] font-medium text-[#00a884] transition hover:bg-[#00a884]/20 active:scale-[0.98]"
                >
                  {b.title}
                </button>
              ))}
            </div>
          </>
        )}

        {msg.kind === "list" && msg.list && (
          <>
            {msg.text && (
              <p
                className="whitespace-pre-wrap leading-relaxed text-[13.5px] mb-2"
                dangerouslySetInnerHTML={{ __html: renderText(msg.text) }}
              />
            )}
            <div className="space-y-1.5">
              {(msg.list.sections || []).map((s, i) => (
                <div key={i}>
                  {s.title && (
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#8696a0]">
                      {s.title}
                    </p>
                  )}
                  <div className="flex flex-col gap-1">
                    {s.rows.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => onAction(r.title, r.id)}
                        className="rounded-xl border border-[#00a884]/30 bg-[#00a884]/8 px-3 py-2 text-left transition hover:bg-[#00a884]/18"
                      >
                        <span className="block text-[13px] font-semibold text-[#e9edef]">
                          {r.title}
                        </span>
                        {r.description && (
                          <span className="block text-[11px] text-[#8696a0]">
                            {r.description}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Timestamp + ticks */}
        <div className="mt-1 flex items-center justify-end gap-1">
          <span className="text-[10px] text-white/40">
            {new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isUser && (
            <svg className="h-3 w-3 text-[#53bdeb]" viewBox="0 0 16 11" fill="currentColor">
              <path d="M11.071.653a.45.45 0 0 0-.63 0L4.1 7.05 1.56 4.51a.45.45 0 0 0-.63.63l2.855 2.855a.45.45 0 0 0 .63 0l6.656-6.713a.45.45 0 0 0 0-.63z"/>
              <path d="M15.07.653a.45.45 0 0 0-.63 0L8.1 7.05a.45.45 0 0 0 .63.63L15.07 1.283a.45.45 0 0 0 0-.63z"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

function DateDivider({ date }) {
  return (
    <div className="flex items-center justify-center my-3">
      <span className="rounded-lg bg-[#182229]/80 px-3 py-0.5 text-[11px] text-[#8696a0] font-medium">
        {date}
      </span>
    </div>
  );
}

function groupByDate(messages) {
  const groups = [];
  let lastDate = null;
  for (const m of messages) {
    const d = new Date(m.createdAt).toLocaleDateString("es-AR", {
      day: "numeric", month: "long", year: "numeric",
    });
    if (d !== lastDate) {
      groups.push({ type: "date", label: d, key: `date-${d}` });
      lastDate = d;
    }
    groups.push({ type: "msg", msg: m, key: m.id });
  }
  return groups;
}

export default function LiveChat({ conversationId, onAction }) {
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const bottomRef                 = useRef(null);
  const seenIds                   = useRef(new Set());
  const pollingRef                = useRef(null);

  const fetchMessages = useCallback(async () => {
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
    } catch { /* ignorar */ } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    setMessages([]);
    seenIds.current = new Set();
    setLoading(true);
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 1000);
    return () => clearInterval(pollingRef.current);
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const items = groupByDate(messages);

  return (
    <div className="flex h-full flex-col bg-[#0b141a]">
      {/* Header estilo WhatsApp */}
      <div className="flex items-center gap-3 bg-[#202c33] px-4 py-2.5 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00a884]/20 text-xl">
          🍽️
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-semibold text-[#e9edef]">El Rincón del Sabor</p>
          <p className="text-[12px] text-[#00a884]">🤖 Bot activo</p>
        </div>
        <div className="flex items-center gap-1 text-[#8696a0]">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
          </svg>
        </div>
      </div>

      {/* Wallpaper / mensajes */}
      <div
        className="flex-1 overflow-y-auto py-2"
        style={{
          background: "oklch(0.12 0.02 200)",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className={`h-10 w-48 animate-pulse rounded-2xl ${i % 2 === 0 ? "bg-[#202c33]" : "bg-[#005c4b]"}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#202c33] text-3xl">
              🍽️
            </div>
            <p className="text-sm text-[#8696a0]">
              Presioná <strong className="text-[#e9edef]">👋 Iniciar</strong> para comenzar el flujo.
            </p>
          </div>
        ) : (
          items.map((item) =>
            item.type === "date" ? (
              <DateDivider key={item.key} date={item.label} />
            ) : (
              <Bubble key={item.key} msg={item.msg} onAction={onAction} />
            )
          )
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
