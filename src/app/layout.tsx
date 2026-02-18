import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CloudFac — Facturación Electrónica Perú",
    template: "%s | CloudFac",
  },
  description:
    "SaaS de facturación electrónica para Perú. Emite facturas, boletas y notas de crédito electrónicas con SUNAT.",
  keywords: [
    "facturación electrónica",
    "Perú",
    "SUNAT",
    "factura electrónica",
    "boleta electrónica",
    "NubeFact",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
