// Bus de eventos simple para empujar mensajes nuevos a los clientes SSE.
// Usamos globalThis para sobrevivir al hot-reload de Next en desarrollo.

function getBus() {
  if (!globalThis.__chatBus) {
    globalThis.__chatBus = { listeners: new Set() };
  }
  return globalThis.__chatBus;
}

export function subscribe(listener) {
  const bus = getBus();
  bus.listeners.add(listener);
  return () => bus.listeners.delete(listener);
}

export function publish(msg) {
  const bus = getBus();
  for (const l of bus.listeners) {
    try {
      l(msg);
    } catch {
      // ignorar listeners caidos
    }
  }
}
