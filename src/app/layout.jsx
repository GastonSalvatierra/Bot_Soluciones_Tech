import "./globals.css";

export const metadata = {
  title: "WhatsApp Menu Bot",
  description:
    "Panel de control del bot de menu oficial de WhatsApp con prompt autoadministrable.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
