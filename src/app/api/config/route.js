// Configuracion autoadministrable (prompt + datos del negocio).
// GET  -> config actual.
// POST -> guarda cambios parciales.

import { NextResponse } from "next/server";
import { getConfig, saveConfig } from "@/lib/store.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getConfig());
}

export async function POST(req) {
  try {
    const body = await req.json();
    const allowed = {};

    if (typeof body.systemPrompt === "string")
      allowed.systemPrompt = body.systemPrompt;
    if (typeof body.businessName === "string")
      allowed.businessName = body.businessName;
    if (typeof body.greeting === "string") allowed.greeting = body.greeting;
    if (typeof body.hours === "string") allowed.hours = body.hours;
    if (typeof body.openDays === "string") allowed.openDays = body.openDays;
    if (Array.isArray(body.products))
      allowed.products = body.products
        .filter((p) => p && typeof p.name === "string")
        .map((p) => ({ name: String(p.name), price: String(p.price ?? "") }));

    const next = saveConfig(allowed);
    return NextResponse.json(next);
  } catch {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
  }
}
