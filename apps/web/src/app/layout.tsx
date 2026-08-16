import type { Metadata } from "next";

import { AuthProvider } from "@/features/auth/components/AuthProvider";

import "./globals.css";
import { QueryProvider } from "@/lib/query/QueryProvider";

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
    <html lang="pt-BR">
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