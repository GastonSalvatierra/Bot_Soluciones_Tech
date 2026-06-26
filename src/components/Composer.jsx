"use client";

import { useState, useRef } from "react";

const QUICK_EMOJIS = ["😊","🙏","👍","❤️","😂","🔥","✅","📋","🛵","💳"];

export default function Composer({ conversationId, onSend, onReset }) {
  const [text, setText]           = useState("");
  const [sending, setSending]     = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef               = useRef(null);

  const send = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setText("");
    setShowEmoji(false);
    await onSend(value);
    setSending(false);
    textareaRef.current?.focus();
  };

  const insertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex-shrink-0 bg-[#202c33]">
      {/* Quick actions */}
      <div className="flex items-center gap-2 border-t border-white/5 px-3 py-2">
        <button
          onClick={() => onSend("Hola")}
          className="rounded-full bg-[#00a884]/15 px-3 py-1 text-[12px] font-medium text-[#00a884] transition hover:bg-[#00a884]/25"
        >
          👋 Iniciar
        </button>
        <button
          onClick={onReset}
          className="rounded-full bg-white/8 px-3 py-1 text-[12px] text-white/60 transition hover:bg-white/15"
        >
          ♻️ Reiniciar
        </button>
        <span className="ml-auto text-[10px] text-white/25 truncate max-w-[120px]">
          {conversationId}
        </span>
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="flex flex-wrap gap-1 border-t border-white/5 px-3 py-2">
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => insertEmoji(e)}
              className="rounded-lg p-1.5 text-lg transition hover:bg-white/10"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 border-t border-white/5 px-3 pb-3 pt-2">
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[#8696a0] transition hover:text-white"
          title="Emoji"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-3.5-7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-3.5 4a4 4 0 0 0 3.464-2H8.536A4 4 0 0 0 12 17z"/>
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Escribí un mensaje como cliente…"
          className="max-h-32 flex-1 resize-none rounded-2xl bg-[#2a3942] px-4 py-2.5 text-[13.5px] text-[#e9edef] placeholder:text-[#8696a0] focus:outline-none"
          style={{ lineHeight: "1.4" }}
        />

        <button
          onClick={send}
          disabled={sending}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white transition hover:bg-[#06cf9c] disabled:opacity-50"
          aria-label="Enviar"
        >
          {sending ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M1.101 21.757 23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
