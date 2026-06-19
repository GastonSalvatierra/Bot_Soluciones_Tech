-- ============================================================
-- Schema para el bot de WhatsApp
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- Configuración del negocio (una sola fila, id = 'default')
create table if not exists config (
  id          text primary key default 'default',
  data        jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);

-- Estado de cada conversación (una fila por número de teléfono)
create table if not exists conversations (
  id          text primary key,          -- número normalizado, ej: "5411XXXXXXXX"
  state       text not null default 'START',
  data        jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);

-- Historial de mensajes (entrantes y salientes)
create table if not exists messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  text not null references conversations(id) on delete cascade,
  role             text not null,        -- 'user' | 'bot'
  kind             text not null,        -- 'text' | 'buttons' | 'list'
  text             text,
  extra            jsonb,               -- buttons, list, etc.
  source           text,                -- 'whatsapp' | 'simulator'
  created_at       timestamptz not null default now()
);

-- Índice para traer mensajes de una conversación ordenados
create index if not exists messages_conv_created
  on messages (conversation_id, created_at);

-- RLS desactivado (el acceso es solo desde tu backend con service_role key)
alter table config        disable row level security;
alter table conversations disable row level security;
alter table messages      disable row level security;
