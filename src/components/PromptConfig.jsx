"use client";

import { useEffect, useState } from "react";

const empty = {
  systemPrompt: "",
  businessName: "",
  greeting: "",
  hours: "",
  openDays: "",
  products: [],
};

export default function PromptConfig() {
  const [config, setConfig] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((c) => setConfig(c))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setStatus("saving");
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 1800);
  };

  const updateProduct = (i, key, value) => {
    const products = [...config.products];
    products[i] = { ...products[i], [key]: value };
    setConfig({ ...config, products });
  };

  if (loading) {
    return <p className="p-6 text-sm text-white/50">Cargando configuracion…</p>;
  }

  const field =
    "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-wa-green/50";
  const label =
    "mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50";

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div>
          <label className={label}>Prompt de la IA (stand-by)</label>
          <textarea
            value={config.systemPrompt}
            onChange={(e) =>
              setConfig({ ...config, systemPrompt: e.target.value })
            }
            rows={6}
            className={field}
            placeholder="Instrucciones para la IA…"
          />
          <p className="mt-1 text-xs text-white/40">
            Este prompt se guarda y se usara automaticamente cuando actives la
            IA (AI_ENABLED=true). No necesitas tocar codigo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Nombre del negocio</label>
            <input
              className={field}
              value={config.businessName}
              onChange={(e) =>
                setConfig({ ...config, businessName: e.target.value })
              }
            />
          </div>
          <div>
            <label className={label}>Horarios</label>
            <input
              className={field}
              value={config.hours}
              onChange={(e) => setConfig({ ...config, hours: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className={label}>Saludo inicial</label>
          <textarea
            className={field}
            rows={2}
            value={config.greeting}
            onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
          />
        </div>

        <div>
          <label className={label}>Dias abiertos</label>
          <input
            className={field}
            value={config.openDays}
            onChange={(e) => setConfig({ ...config, openDays: e.target.value })}
          />
        </div>

        <div>
          <label className={label}>Productos y precios</label>
          <div className="space-y-2">
            {config.products.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={field}
                  value={p.name}
                  placeholder="Producto"
                  onChange={(e) => updateProduct(i, "name", e.target.value)}
                />
                <input
                  className={`${field} max-w-32`}
                  value={p.price}
                  placeholder="$"
                  onChange={(e) => updateProduct(i, "price", e.target.value)}
                />
                <button
                  onClick={() =>
                    setConfig({
                      ...config,
                      products: config.products.filter((_, j) => j !== i),
                    })
                  }
                  className="rounded-lg bg-white/5 px-3 text-white/50 hover:bg-red-500/20 hover:text-red-300"
                  aria-label="Eliminar"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setConfig({
                  ...config,
                  products: [...config.products, { name: "", price: "" }],
                })
              }
              className="rounded-lg border border-dashed border-white/20 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5"
            >
              + Agregar producto
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-white/10 p-4">
        <button
          onClick={save}
          disabled={status === "saving"}
          className="rounded-lg bg-wa-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-wa-green-dark disabled:opacity-50"
        >
          {status === "saving" ? "Guardando…" : "Guardar configuracion"}
        </button>
        {status === "saved" && (
          <span className="text-sm text-wa-green">✓ Guardado</span>
        )}
      </div>
    </div>
  );
}
