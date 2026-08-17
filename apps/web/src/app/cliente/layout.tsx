import type {
    ReactNode,
} from "react";

import {
    ClientGuard,
} from "@/features/auth/components/ClientGuard";

type ClientLayoutProps = {
    children: ReactNode;
};

export default function ClientLayout({
    children,
}: ClientLayoutProps) {
    return (
        <ClientGuard>
            {children}
        </ClientGuard>
    );
}