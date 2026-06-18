"use client";

import { useState } from "react";

export default function Composer({ conversationId, onSend, onReset }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setText("");
    await onSend(value);
    setSending(false);
  };

  return (
    <div className="border-t border-white/10 bg-wa-panel p-3">
      <div className="mb-2 flex flex-wrap gap-2">
        <button
          onClick={() => onSend("Hola")}
          className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 transition hover:bg-white/20"
        >
          👋 Iniciar
        </button>
        <button
          onClick={onReset}
          className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 transition hover:bg-white/20"
        >
          ♻️ Reiniciar conversacion
        </button>
        <span className="ml-auto self-center text-xs text-white/40">
          Simulando como {conversationId}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Escribi un mensaje como cliente…"
          className="max-h-32 flex-1 resize-none rounded-2xl bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-wa-green/50"
        />
        <button
          onClick={send}
          disabled={sending}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-wa-green text-white transition hover:bg-wa-green-dark disabled:opacity-50"
          aria-label="Enviar"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
