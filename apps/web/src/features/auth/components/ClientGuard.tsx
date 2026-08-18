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
        clientLink,
        emailVerified,
        loading: authLoading,
        sessionError,
    } =
        useAuth();

    const [
        authorized,
        setAuthorized,
    ] =
        useState(false);

    const [
        checkingAccess,
        setCheckingAccess,
    ] =
        useState(true);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        setAuthorized(false);
        setCheckingAccess(true);

        if (!user) {
            router.replace(
                "/entrar",
            );

            setCheckingAccess(
                false,
            );

            return;
        }

        if (
            sessionError ||
            !appUser
        ) {
            router.replace(
                "/entrar",
            );

            setCheckingAccess(
                false,
            );

            return;
        }

        if (
            appUser.role ===
            USER_ROLES.ADMIN
        ) {
            router.replace(
                "/admin",
            );

            setCheckingAccess(
                false,
            );

            return;
        }

        if (
            appUser.role !==
            USER_ROLES.CLIENT
        ) {
            router.replace(
                "/entrar",
            );

            setCheckingAccess(
                false,
            );

            return;
        }

        if (!emailVerified) {
            router.replace(
                "/verificar-email",
            );

            setCheckingAccess(
                false,
            );

            return;
        }

        /*
         * Conta autenticada e verificada,
         * mas ainda não existe cliente
         * correspondente no salão.
         */
        if (
            clientLink?.status ===
            "NO_MATCH"
        ) {
            router.replace(
                "/completar-cadastro",
            );

            setCheckingAccess(
                false,
            );

            return;
        }

        /*
         * Cliente vinculada corretamente.
         */
        if (
            clientLink?.status ===
            "LINKED" ||
            clientLink?.status ===
            "ALREADY_LINKED"
        ) {
            setAuthorized(
                true,
            );

            setCheckingAccess(
                false,
            );

            return;
        }

        /*
         * Outros estados especiais
         * continuam visíveis na área
         * temporária para diagnóstico.
         *
         * Quando criarmos a UX final,
         * teremos telas específicas.
         */
        setAuthorized(true);
        setCheckingAccess(false);
    }, [
        appUser,
        authLoading,
        clientLink,
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