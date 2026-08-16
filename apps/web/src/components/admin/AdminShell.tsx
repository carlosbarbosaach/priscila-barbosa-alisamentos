import type { ReactNode } from "react";

import { AdminMobileHeader } from "./AdminMobileHeader";
import { AdminSidebar } from "./AdminSidebar";

type AdminShellProps = {
    children: ReactNode;
};

export function AdminShell({
    children,
}: AdminShellProps) {
    return (
        <div className="min-h-screen bg-[#F7F3EB]">
            <div className="flex min-h-screen">
                <div className="sticky top-0 hidden h-screen w-[280px] shrink-0 lg:block">
                    <AdminSidebar />
                </div>

                <div className="min-w-0 flex-1">
                    <AdminMobileHeader />

                    <div className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}