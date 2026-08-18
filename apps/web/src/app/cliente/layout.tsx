import type {
  ReactNode,
} from "react";

import {
  ClientGuard,
} from "@/features/auth/components/ClientGuard";

import {
  ClientShell,
} from "@/features/clients/components/ClientShell";

type ClientLayoutProps = {
  children: ReactNode;
};

export default function ClientLayout({
  children,
}: ClientLayoutProps) {
  return (
    <ClientGuard>
      <ClientShell>
        {children}
      </ClientShell>
    </ClientGuard>
  );
}