import type { ReactNode } from "react";

import { AdminGuard } from "@/features/auth/components/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <AdminGuard>
      <AdminShell>
        {children}
      </AdminShell>
    </AdminGuard>
  );
}