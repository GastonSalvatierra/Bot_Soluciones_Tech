// Página pública de Política de Privacidad.
// URL: https://tu-app.vercel.app/privacy
// Esta es la URL que se ingresa en Meta for Developers → App Settings →
// Basic → Privacy Policy URL (requerido para pasar la app a modo Live).

export const metadata = {
    title: "Política de Privacidad — Soluciones Tech",
    description: "Política de privacidad del asistente virtual de WhatsApp de Soluciones Tech.",
  };
  
  const LAST_UPDATED = "19 de junio de 2026";
  const CONTACT_EMAIL = "solucionestech2025@gmail.com";
  const BUSINESS_NAME = "Soluciones Tech";
  
  export default function PrivacyPolicyPage() {
    return (
      <main className="min-h-screen bg-wa-bg text-[oklch(0.95_0_0)]">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
          <header className="mb-12 border-b border-white/10 pb-8">
            <p className="mb-2 text-sm font-medium tracking-wide text-wa-green uppercase">
              {BUSINESS_NAME}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Política de Privacidad
            </h1>
            <p className="mt-3 text-sm text-white/50">
              Última actualización: {LAST_UPDATED}
            </p>
          </header>
  
          <article className="space-y-10 leading-relaxed text-[oklch(0.88_0_0)]">
            <section>
              <p>
                Esta política describe cómo {BUSINESS_NAME} ("nosotros") recolecta,
                usa y protege la información cuando interactuás con nuestro
                asistente virtual a través de WhatsApp. Al escribirle a nuestro
                número de WhatsApp, aceptás las prácticas descritas acá.
              </p>
            </section>
  
            <Section title="Qué información recolectamos">
              <p>Cuando interactuás con el bot, podemos recolectar:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 marker:text-wa-green">
                <li>Tu número de teléfono de WhatsApp.</li>
                <li>El contenido de los mensajes que nos enviás (texto, botones u opciones seleccionadas).</li>
                <li>Datos que nos proporciones directamente durante la conversación, como nombre, apellido y número de documento, cuando el flujo del bot los solicita.</li>
                <li>Marcas de tiempo y metadatos técnicos asociados a cada mensaje (por ejemplo, fecha y hora de envío).</li>
              </ul>
            </Section>
  
            <Section title="Cómo usamos tu información">
              <p>Usamos los datos recolectados exclusivamente para:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 marker:text-wa-green">
                <li>Responder tus consultas y guiarte a través del menú del asistente.</li>
                <li>Mantener el contexto de la conversación entre mensajes (por ejemplo, recordar tu nombre durante la sesión).</li>
                <li>Mejorar el funcionamiento del bot y resolver errores técnicos.</li>
              </ul>
              <p className="mt-3">
                No usamos tu información para publicidad ni la vendemos a terceros.
              </p>
            </Section>
  
            <Section title="Con quién compartimos información">
              <p>
                No compartimos tu información personal con terceros, salvo en los
                siguientes casos:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 marker:text-wa-green">
                <li>
                  Con Meta Platforms, Inc. (WhatsApp), en la medida necesaria para
                  operar el servicio a través de la WhatsApp Business Platform.
                </li>
                <li>
                  Con nuestro proveedor de infraestructura (Supabase, para
                  almacenamiento de datos, y Vercel, para hosting), quienes
                  procesan los datos en nuestro nombre bajo sus propias políticas
                  de seguridad.
                </li>
                <li>Cuando la ley nos obligue a hacerlo.</li>
              </ul>
            </Section>
  
            <Section title="Cuánto tiempo conservamos tus datos">
              <p>
                Conservamos el historial de conversación y los datos asociados
                mientras sea necesario para brindarte el servicio. Podés
                solicitar la eliminación de tus datos en cualquier momento
                escribiéndonos al email de contacto que figura abajo.
              </p>
            </Section>
  
            <Section title="Seguridad">
              <p>
                Tomamos medidas razonables para proteger tu información,
                incluyendo el uso de conexiones cifradas y acceso restringido a
                nuestra base de datos. Sin embargo, ningún sistema es 100%
                seguro, y no podemos garantizar la seguridad absoluta de la
                información transmitida.
              </p>
            </Section>
  
            <Section title="Tus derechos">
              <p>
                Podés solicitarnos en cualquier momento que te informemos qué
                datos tenemos sobre vos, que los corrijamos, o que los
                eliminemos. Para ejercer estos derechos, escribinos a{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-wa-green underline underline-offset-2 hover:text-wa-green-dark"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </Section>
  
            <Section title="Cambios a esta política">
              <p>
                Podemos actualizar esta política ocasionalmente. Si hacemos
                cambios importantes, actualizaremos la fecha al inicio de este
                documento.
              </p>
            </Section>
  
            <Section title="Contacto">
              <p>
                Si tenés preguntas sobre esta política o sobre cómo manejamos tu
                información, escribinos a{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-wa-green underline underline-offset-2 hover:text-wa-green-dark"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </Section>
          </article>
  
          <footer className="mt-16 border-t border-white/10 pt-6 text-sm text-white/40">
            {BUSINESS_NAME} — Asistente virtual de WhatsApp
          </footer>
        </div>
      </main>
    );
  }
  
  function Section({ title, children }) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">{title}</h2>
        {children}
      </section>
    );
  }