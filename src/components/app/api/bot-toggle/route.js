// Activa o desactiva el bot automático para una conversación específica.
// Guarda botPaused: true/false en conversations.data

import { NextResponse } from "next/server";
import { getConversation, saveConversation } from "@/lib/store.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { conversationId, botPaused } = await req.json();

    if (!conversationId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const conv = await getConversation(conversationId);
    conv.data = { ...conv.data, botPaused: Boolean(botPaused) };
    await saveConversation(conv);

    return NextResponse.json({ ok: true, botPaused: conv.data.botPaused });
  } catch (err) {
    console.error("[bot-toggle] Error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const conversationId = req.nextUrl.searchParams.get("conversationId");
    if (!conversationId) return NextResponse.json({ botPaused: false });

    const conv = await getConversation(conversationId);
    return NextResponse.json({ botPaused: Boolean(conv.data?.botPaused) });
  } catch {
    return NextResponse.json({ botPaused: false });
  }
}
