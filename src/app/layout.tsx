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
  title: "DS160 - Formulário de Visto Americano | IHS Vistos",
  description: "Sistema de preenchimento do formulário DS160 para visto americano. IHS Vistos - Especialistas em visto americano.",
  keywords: ["DS160", "Visto Americano", "US Visa", "IHS Vistos", "Turismo", "EUA"],
  authors: [{ name: "IHS Vistos" }],
  icons: {
    icon: "/logo-ihsvistos.png",
  },
  openGraph: {
    title: "DS160 - Formulário de Visto Americano",
    description: "Preencha seu formulário DS160 com a IHS Vistos",
    url: "https://vistoamericano.com.br",
    siteName: "IHS Vistos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DS160 - Formulário de Visto Americano",
    description: "Preencha seu formulário DS160 com a IHS Vistos",
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
