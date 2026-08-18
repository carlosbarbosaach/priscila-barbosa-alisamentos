import type { Metadata } from "next";

import {
  Geist_Mono,
  Manrope,
} from "next/font/google";

import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { QueryProvider } from "@/lib/query/QueryProvider";

import "./globals.css";

/*
 * Fonte principal do sistema.
 */
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

/*
 * Fonte utilizada apenas quando
 * precisarmos de font-mono.
 */
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Priscila Barbosa Alisamentos",
  description: "Sistema de agendamentos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${geistMono.variable}`}
    >
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}