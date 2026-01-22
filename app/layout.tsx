import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Galáxia Gourmet - Gestão para Delivery",
  description: "Sistema SaaS de gestão financeira e operacional para delivery. Controle seus pedidos, custos, taxas e lucros em tempo real.",
  keywords: "delivery, gestão, ifood, lucro, margem, MEI, restaurante",
  authors: [{ name: "jaoadev", url: "https://github.com/jaoadev" }],
  icons: {
    icon: [
      { url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌌</text></svg>", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={sora.className}>{children}</body>
    </html>
  );
}
