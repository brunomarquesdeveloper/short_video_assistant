import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Short Video Assistant",
  description:
    "Simplifique a rotina de criadores de conteúdo com corte de vídeos no navegador e notificações Web Push para agendamento de Reels, TikTok e Shorts.",
  keywords: [
    "vídeos curtos",
    "Reels",
    "TikTok",
    "Shorts",
    "corte de vídeo",
    "agendamento",
    "FFmpeg",
    "Web Push",
  ],
  authors: [{ name: "Short Video Assistant Team" }],
  openGraph: {
    title: "Short Video Assistant — Corte, Organização e Agendamento",
    description:
      "Solução intuitiva para corte, processamento, organização e agendamento de postagens em formato de vídeo curto.",
    url: "https://shortvideoassistant.app",
    siteName: "Short Video Assistant",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Short Video Assistant",
    description:
      "Simplifique sua rotina de criador com corte de vídeos e notificações de agendamento.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}