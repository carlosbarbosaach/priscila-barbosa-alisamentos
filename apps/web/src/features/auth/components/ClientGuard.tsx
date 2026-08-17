"use client";

import {
    USER_ROLES,
} from "@priscila/shared";

import {
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    useAuth,
} from "../hooks/useAuth";

type ClientGuardProps = {
    children: ReactNode;
};

export function ClientGuard({
    children,
}: ClientGuardProps) {
    const router =
        useRouter();

    const {
        user,
        appUser,
        emailVerified,
        loading: authLoading,
        sessionError,
    } = useAuth();

    const [
        authorized,
        setAuthorized,
    ] = useState(false);

    const [
        checkingAccess,
        setCheckingAccess,
    ] = useState(true);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        setAuthorized(false);
        setCheckingAccess(true);

        /*
         * Não autenticada.
         */
        if (!user) {
            router.replace(
                "/entrar",
            );

            setCheckingAccess(false);

            return;
        }

        /*
         * Firebase autenticou,
         * mas nossa sessão não
         * conseguiu ser resolvida.
         */
        if (
            sessionError ||
            !appUser
        ) {
            router.replace(
                "/entrar",
            );

            setCheckingAccess(false);

            return;
        }

        /*
         * ADMIN permanece exclusivamente
         * na área administrativa.
         */
        if (
            appUser.role ===
            USER_ROLES.ADMIN
        ) {
            router.replace(
                "/admin",
            );

            setCheckingAccess(false);

            return;
        }

        if (
            appUser.role !==
            USER_ROLES.CLIENT
        ) {
            router.replace(
                "/entrar",
            );

            setCheckingAccess(false);

            return;
        }

        /*
         * CLIENT com e-mail ainda
         * não verificado não entra
         * na área de agendamentos.
         */
        if (!emailVerified) {
            router.replace(
                "/verificar-email",
            );

            setCheckingAccess(false);

            return;
        }

        setAuthorized(true);
        setCheckingAccess(false);
    }, [
        appUser,
        authLoading,
        emailVerified,
        router,
        sessionError,
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