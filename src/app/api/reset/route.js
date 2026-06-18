// Limpia mensajes y conversaciones (util durante pruebas locales).

import { NextResponse } from "next/server";
import { clearAll } from "@/lib/store.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  clearAll();
  return NextResponse.json({ ok: true });
}
