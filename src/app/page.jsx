"use client";

import { useState } from "react";
import LiveChat from "@/components/LiveChat.jsx";
import Composer from "@/components/Composer.jsx";
import PromptConfig from "@/components/PromptConfig.jsx";

const CONVERSATION_ID = "demo";

export default function Home() {
  const [tab, setTab] = useState("chat");
  const [chatKey, setChatKey] = useState(0); // fuerza re-mount del chat al resetear

  const send = async (text, payloadId) => {
    await fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: CONVERSATION_ID, text, payloadId }),
    });
  };

  const reset = async () => {
    await fetch("/api/reset", { method: "POST" });
    setChatKey((k) => k + 1); // re-monta LiveChat limpio, sin reload de página
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 p-4 md:p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-white md:text-2xl">
          🟢 WhatsApp Menu Bot — Panel de control
        </h1>
        <p className="text-sm text-white/50">
          Flujo guiado con menús oficiales · prompt autoadministrable · OpenAI
          listo en stand-by.
        </p>
      </header>

      {/* Tabs solo en mobile */}
      <div className="flex gap-2 md:hidden">
        <button
          onClick={() => setTab("chat")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
            tab === "chat" ? "bg-wa-green text-white" : "bg-white/5 text-white/60"
          }`}
        >
          Mensajes
        </button>
        <button
          onClick={() => setTab("config")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
            tab === "config"
              ? "bg-wa-green text-white"
              : "bg-white/5 text-white/60"
          }`}
        >
          Configuración
        </button>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
        {/* Columna chat */}
        <section
          className={`flex h-[78vh] flex-col overflow-hidden rounded-xl border border-white/10 bg-wa-panel ${
            tab === "chat" ? "" : "hidden md:flex"
          }`}
        >
          <div className="flex-1 overflow-hidden">
            <LiveChat
              key={chatKey}
              conversationId={CONVERSATION_ID}
              onAction={send}
            />
          </div>
          <Composer
            conversationId={CONVERSATION_ID}
            onSend={send}
            onReset={reset}
          />
        </section>

        {/* Columna config */}
        <section
          className={`flex h-[78vh] flex-col overflow-hidden rounded-xl border border-white/10 bg-wa-panel ${
            tab === "config" ? "" : "hidden md:flex"
          }`}
        >
          <div className="border-b border-white/10 px-5 py-3">
            <h2 className="text-sm font-semibold text-white">
              ⚙️ Configuración autoadministrada
            </h2>
          </div>
          <PromptConfig />
        </section>
      </div>
    </main>
  );
}
