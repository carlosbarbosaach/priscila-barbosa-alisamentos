"use client";

import {
    USER_ROLES,
} from "@priscila/shared";

import {
    Loader2,
    MessageCircle,
    UserRound,
} from "lucide-react";

import {
    useEffect,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    CompleteClientProfileForm,
} from "@/features/auth/components/CompleteClientProfileForm";

import {
    useAuth,
} from "@/features/auth/hooks/useAuth";

export default function CompleteClientProfilePage() {
    const router =
        useRouter();

    const {
        user,
        appUser,
        clientLink,
        emailVerified,
        loading,
    } =
        useAuth();

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!user) {
            router.replace(
                "/entrar",
            );

            return;
        }

        if (!appUser) {
            return;
        }

        if (
            appUser.role ===
            USER_ROLES.ADMIN
        ) {
            router.replace(
                "/admin",
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

            return;
        }

        if (!emailVerified) {
            router.replace(
                "/verificar-email",
            );

            return;
        }

        /*
         * Cliente já vinculada.
         * Não precisa completar nada.
         */
        if (
            clientLink?.status ===
            "LINKED" ||
            clientLink?.status ===
            "ALREADY_LINKED"
        ) {
            router.replace(
                "/cliente",
            );
        }
    }, [
        appUser,
        clientLink,
        emailVerified,
        loading,
        router,
        user,
    ]);

    if (
        loading ||
        !user ||
        !appUser
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F7F5EF]">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </main>
        );
    }

    /*
     * Somente NO_MATCH pode abrir
     * o formulário de cliente nova.
     */
    if (
        clientLink?.status !==
        "NO_MATCH"
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F7F5EF] px-4">
                <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
                    <h1 className="text-xl font-semibold">
                        Não foi possível concluir o acesso
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        O cadastro precisa ser analisado antes
                        de continuar.
                    </p>

                    <p className="mt-4 text-sm font-medium">
                        Status:{" "}
                        {clientLink?.status ??
                            "SEM_STATUS"}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F7F5EF] px-4 py-10">
            <div className="w-full max-w-lg rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-[#304229] text-white">
                    <UserRound className="size-6" />
                </div>

                <p className="mt-7 text-sm font-medium tracking-wide text-[#65715F]">
                    PRISCILA BARBOSA ALISAMENTOS
                </p>

                <h1 className="mt-2 text-2xl font-semibold">
                    Complete seu cadastro
                </h1>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Precisamos apenas de mais algumas
                    informações para liberar sua área de
                    agendamentos.
                </p>

                <div className="mt-5 flex gap-3 rounded-xl bg-[#F5EBD2] p-4 text-[#70572A]">
                    <MessageCircle className="mt-0.5 size-5 shrink-0" />

                    <p className="text-sm leading-6">
                        Seu WhatsApp será utilizado futuramente
                        para informações e confirmações dos
                        seus agendamentos.
                    </p>
                </div>

                <div className="mt-7">
                    <CompleteClientProfileForm />
                </div>
            </div>
        </main>
    );
}