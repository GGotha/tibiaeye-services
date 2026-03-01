import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tibiaeye.com"),
  title: "TibiaEye - Bot de Tibia com Dashboard em Tempo Real",
  description:
    "Pixel bot para Tibia com dashboard de monitoramento em tempo real. Acompanhe XP/h, kills, loot e posição no mapa ao vivo, de qualquer lugar.",
  keywords: [
    "tibia bot",
    "tibia pixel bot",
    "tibia automation",
    "tibia dashboard",
    "tibia xp tracker",
    "tibiaeye",
  ],
  authors: [{ name: "TibiaEye" }],
  creator: "TibiaEye",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://tibiaeye.com",
    title: "TibiaEye - Bot de Tibia com Dashboard em Tempo Real",
    description:
      "Pixel bot para Tibia com dashboard de monitoramento em tempo real. Acompanhe XP/h, kills, loot e posição no mapa ao vivo.",
    siteName: "TibiaEye",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TibiaEye - Bot de Tibia com Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TibiaEye - Bot de Tibia com Dashboard em Tempo Real",
    description: "Pixel bot para Tibia com dashboard de monitoramento em tempo real.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#06060B] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
