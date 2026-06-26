"use client";

import { useState } from "react";
import ConversationList from "@/components/ConversationList.jsx";
import ChatViewer from "@/components/ChatViewer.jsx";
import LiveChat from "@/components/LiveChat.jsx";
import Composer from "@/components/Composer.jsx";

const SIM_ID = "demo";

export default function Home() {
  const [selectedId, setSelectedId] = useState(null);
  const [simKey, setSimKey] = useState(0);
  const [mobileTab, setMobileTab] = useState("chats"); // "chats" | "viewer" | "sim"

  const send = async (text, payloadId) => {
    await fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: SIM_ID, text, payloadId }),
    });
  };

  const reset = async () => {
    await fetch("/api/reset", { method: "POST" });
    setSimKey((k) => k + 1);
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    setMobileTab("viewer");
  };

  return (
    <div className="flex h-screen flex-col bg-wa-bg">
      {/* Top bar */}
      <header className="flex flex-shrink-0 items-center gap-3 border-b border-white/8 bg-wa-panel px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wa-green/20 text-lg">
          🟢
        </div>
        <div>
          <h1 className="text-[14px] font-bold leading-tight text-white">
            WhatsApp Bot — Panel
          </h1>
          <p className="text-[11px] text-white/35">
            Conversaciones reales · Simulador de flujo
          </p>
        </div>

        {/* Nav móvil */}
        <div className="ml-auto flex gap-1 md:hidden">
          {[
            { id: "chats", label: "Chats" },
            { id: "viewer", label: "Ver" },
            { id: "sim", label: "Test" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setMobileTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                mobileTab === t.id
                  ? "bg-wa-green text-white"
                  : "bg-white/8 text-white/50 hover:bg-white/12"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main: 3 columnas en desktop, tabs en mobile */}
      <div className="flex min-h-0 flex-1">
        {/* ── Columna 1: Lista de conversaciones ── */}
        <aside
          className={`flex-shrink-0 border-r border-white/8 bg-wa-panel md:w-[260px] ${
            mobileTab === "chats" ? "flex w-full flex-col" : "hidden md:flex md:flex-col"
          }`}
        >
          <ConversationList selectedId={selectedId} onSelect={handleSelect} />
        </aside>

        {/* ── Columna 2: Visor del chat real ── */}
        <main
          className={`min-w-0 flex-1 border-r border-white/8 bg-[oklch(0.19_0.02_160)] ${
            mobileTab === "viewer" ? "flex flex-col" : "hidden md:flex md:flex-col"
          }`}
        >
          <ChatViewer conversationId={selectedId} />
        </main>

        {/* ── Columna 3: Simulador de flujo ── */}
        <aside
          className={`flex-shrink-0 bg-wa-panel md:w-[340px] ${
            mobileTab === "sim" ? "flex w-full flex-col" : "hidden md:flex md:flex-col"
          }`}
        >
          {/* Header del simulador */}
          <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
            <span className="text-base">🧪</span>
            <div>
              <p className="text-[13px] font-semibold text-white/90">
                Simulador de flujo
              </p>
              <p className="text-[11px] text-white/35">
                Probá el bot como si fueses un cliente
              </p>
            </div>
          </div>

          {/* Chat simulado */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <LiveChat
                key={simKey}
                conversationId={SIM_ID}
                onAction={send}
              />
            </div>
            <Composer
              conversationId={SIM_ID}
              onSend={send}
              onReset={reset}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
