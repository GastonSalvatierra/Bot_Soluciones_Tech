// Lista todas las conversaciones con su último mensaje.
// Usado por el panel de administración para mostrar los chats activos.

import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

export async function GET() {
  const supabase = getSupabase();

  // Traer todas las conversaciones ordenadas por última actualización
  const { data: convs, error: convErr } = await supabase
    .from("conversations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (convErr) {
    console.error("[conversations] error:", convErr.message);
    return Response.json([], { headers: { "Cache-Control": "no-store" } });
  }

  // Para cada conversación, traer el último mensaje
  const results = await Promise.all(
    (convs ?? []).map(async (conv) => {
      const { data: msgs } = await supabase
        .from("messages")
        .select("text, role, kind, created_at")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const last = msgs?.[0];
      const unread_count_query = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .eq("role", "user");

      return {
        id: conv.id,
        state: conv.state,
        updatedAt: conv.updated_at,
        lastMessage: last
          ? {
              text: last.text,
              role: last.role,
              kind: last.kind,
              createdAt: last.created_at,
            }
          : null,
        messageCount: unread_count_query.count ?? 0,
      };
    })
  );

  return Response.json(results, {
    headers: { "Cache-Control": "no-store" },
  });
}
