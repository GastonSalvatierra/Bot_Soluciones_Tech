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
  // "panel" = chats reales, "sim" = simulador
  const [view, setView] = useState("panel");
  // mobile: "chats" | "chat"
  const [mobileTab, setMobileTab] = useState("chats");

  const simSend = async (text, payloadId) => {
    await fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: SIM_ID, text, payloadId }),
    });
  };

  const simReset = async () => {
    await fetch("/api/reset", { method: "POST" });
    setSimKey((k) => k + 1);
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    setMobileTab("chat");
  };

  return (
    <div className="flex h-screen flex-col bg-wa-bg">
      {/* Top bar */}
      <header className="flex flex-shrink-0 items-center gap-3 border-b border-white/8 bg-wa-panel px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wa-green/20 text-lg">
          🟢
        </div>
        <div className="mr-auto">
          <h1 className="text-[14px] font-bold leading-tight text-white">
            WhatsApp Bot — Panel
          </h1>
          <p className="text-[11px] text-white/35">
            {view === "panel" ? "Conversaciones reales" : "Simulador de flujo"}
          </p>
        </div>

        {/* Switcher Panel / Simulador */}
        <div className="flex rounded-xl bg-white/6 p-1">
          <button
            onClick={() => setView("panel")}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
              view === "panel"
                ? "bg-wa-green text-white shadow"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            💬 Chats
          </button>
          <button
            onClick={() => setView("sim")}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
              view === "sim"
                ? "bg-white/15 text-white shadow"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            🧪 Simulador
          </button>
        </div>

        {/* Mobile: tabs dentro del panel de chats */}
        {view === "panel" && (
          <div className="flex gap-1 md:hidden">
            <button
              onClick={() => setMobileTab("chats")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                mobileTab === "chats"
                  ? "bg-wa-green text-white"
                  : "bg-white/8 text-white/50"
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setMobileTab("chat")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                mobileTab === "chat"
                  ? "bg-wa-green text-white"
                  : "bg-white/8 text-white/50"
              }`}
            >
              Chat
            </button>
          </div>
        )}
      </header>

      {/* ── Vista: Panel de chats reales ── */}
      {view === "panel" && (
        <div className="flex min-h-0 flex-1">
          {/* Lista de conversaciones */}
          <aside
            className={`flex-shrink-0 border-r border-white/8 bg-wa-panel md:w-[280px] ${
              mobileTab === "chats"
                ? "flex w-full flex-col"
                : "hidden md:flex md:flex-col"
            }`}
          >
            <ConversationList selectedId={selectedId} onSelect={handleSelect} />
          </aside>

          {/* Chat viewer con toggle + composer */}
          <main
            className={`min-w-0 flex-1 bg-[oklch(0.19_0.02_160)] ${
              mobileTab === "chat"
                ? "flex flex-col"
                : "hidden md:flex md:flex-col"
            }`}
          >
            <ChatViewer conversationId={selectedId} />
          </main>
        </div>
      )}

      {/* ── Vista: Simulador ── */}
      {view === "sim" && (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Info bar */}
          <div className="flex flex-shrink-0 items-center gap-2 border-b border-white/8 bg-wa-panel/60 px-5 py-2">
            <span className="text-[11px] text-white/35">
              Simulando flujo completo como cliente · conversación aislada · no afecta chats reales
            </span>
            <button
              onClick={simReset}
              className="ml-auto rounded-lg bg-white/6 px-3 py-1 text-[12px] text-white/50 transition hover:bg-white/12 hover:text-white/80"
            >
              ♻️ Reiniciar
            </button>
          </div>

          {/* Simulador centrado */}
          <div className="flex flex-1 items-start justify-center overflow-hidden p-4 md:p-8">
            <div className="flex h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <div className="flex-1 overflow-hidden">
                <LiveChat
                  key={simKey}
                  conversationId={SIM_ID}
                  onAction={simSend}
                />
              </div>
              <Composer
                conversationId={SIM_ID}
                onSend={simSend}
                onReset={simReset}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
