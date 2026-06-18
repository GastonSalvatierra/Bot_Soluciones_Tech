"use client";

import { useEffect, useRef, useState } from "react";

function Bubble({ msg, onAction }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow ${
          isUser
            ? "bg-wa-bubble-user text-white rounded-br-sm"
            : "bg-wa-bubble-bot text-neutral-900 rounded-bl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

        {msg.kind === "buttons" && msg.buttons && (
          <div className="mt-2 flex flex-col gap-1">
            {msg.buttons.map((b) => (
              <button
                key={b.id}
                onClick={() => onAction(b.id, b.title)}
                className="rounded-lg border border-wa-green/40 bg-white px-3 py-1.5 text-center text-sm font-medium text-wa-green-dark transition hover:bg-wa-green/10"
              >
                {b.title}
              </button>
            ))}
          </div>
        )}

        {msg.kind === "list" && msg.list && (
          <div className="mt-2 space-y-2">
            {msg.list.sections.map((s, i) => (
              <div key={i}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {s.title}
                </p>
                <div className="flex flex-col gap-1">
                  {s.rows.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => onAction(r.id, r.title)}
                      className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-left transition hover:bg-wa-green/10"
                    >
                      <span className="block text-sm font-medium text-neutral-800">
                        {r.title}
                      </span>
                      {r.description && (
                        <span className="block text-xs text-neutral-500">
                          {r.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="pt-1 text-center text-xs font-semibold text-wa-green-dark">
              ☰ {msg.list.buttonText}
            </p>
          </div>
        )}

        <p
          className={`mt-1 text-right text-[10px] ${
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
  );
}

export default function LiveChat({ conversationId, onAction }) {
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages([]);
    const es = new EventSource(
      `/api/messages?stream=1&conversationId=${encodeURIComponent(conversationId)}`,
    );
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
        );
      } catch {
        /* ignore */
      }
    };
    return () => es.close();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 rounded-t-xl bg-wa-green-dark px-4 py-3 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">
          🤖
        </div>
        <div>
          <p className="text-sm font-semibold">Bot WhatsApp</p>
          <p className="text-xs text-white/70">en linea · {conversationId}</p>
        </div>
      </div>

      <div className="chat-pattern flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="mt-10 text-center text-sm text-white/50">
            No hay mensajes todavia. Escribi algo en el simulador o desde
            WhatsApp para iniciar el flujo.
          </p>
        ) : (
          messages.map((m) => <Bubble key={m.id} msg={m} onAction={onAction} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
