import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DS160 - Formulário de Visto Americano | SB Viagens e Turismo",
  description: "Sistema de preenchimento do formulário DS160 para visto americano. SB Viagens e Turismo - Especialistas em visto americano.",
  keywords: ["DS160", "Visto Americano", "US Visa", "SB Viagens", "Turismo", "EUA"],
  authors: [{ name: "SB Viagens e Turismo" }],
  icons: {
    icon: "https://sbturismoeviagens.com.br/wp-content/uploads/2024/08/cropped-sb-turismo-logo-192x192.png",
  },
  openGraph: {
    title: "DS160 - Formulário de Visto Americano",
    description: "Preencha seu formulário DS160 com a SB Viagens e Turismo",
    url: "https://vistoamericano.com.br",
    siteName: "SB Viagens e Turismo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DS160 - Formulário de Visto Americano",
    description: "Preencha seu formulário DS160 com a SB Viagens e Turismo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
