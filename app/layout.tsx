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
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "Galáxia Gourmet",
    description: "Sistema de gestão inteligente para delivery",
    images: ["/images/logo-full.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${sora.className} bg-galaxia-pattern`}>{children}</body>
    </html>
  );
}
