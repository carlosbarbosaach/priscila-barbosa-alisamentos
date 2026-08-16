"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { getAdminUser } from "../services/admin.api";
import { useAuth } from "../hooks/useAuth";

type AdminGuardProps = {
    children: ReactNode;
};

export function AdminGuard({
    children,
}: AdminGuardProps) {
    const router = useRouter();

    const {
        user,
        loading: authLoading,
    } = useAuth();

    const [authorized, setAuthorized] =
        useState(false);

    const [checkingAccess, setCheckingAccess] =
        useState(true);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            router.replace("/login");
            return;
        }

        async function validateAdminAccess() {
            try {
                await getAdminUser();

                setAuthorized(true);
            } catch {
                router.replace("/login");
            } finally {
                setCheckingAccess(false);
            }
        }

        void validateAdminAccess();
    }, [
        authLoading,
        router,
        user,
    ]);

    if (
        authLoading ||
        checkingAccess ||
        !authorized
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Verificando acesso...
                </p>
            </main>
        );
    }

    return children;
}