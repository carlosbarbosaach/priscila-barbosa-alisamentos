"use client";

import {
    CalendarDays,
    Loader2,
    Scissors,
} from "lucide-react";

import {
    useEffect,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    USER_ROLES,
} from "@priscila/shared";

import {
    LoginForm,
} from "@/features/auth/components/LoginForm";

import {
    useAuth,
} from "@/features/auth/hooks/useAuth";
import Link from "next/link";

export default function ClientLoginPage() {
    const router =
        useRouter();

    const {
        user,
        appUser,
        emailVerified,
        loading,
    } = useAuth();

    useEffect(() => {
        /*
         * Enquanto Firebase + backend
         * ainda estão resolvendo a sessão,
         * não fazemos redirecionamento.
         */
        if (loading) {
            return;
        }

        /*
         * Sem usuário autenticado:
         * permanece na tela de login.
         */
        if (!user) {
            return;
        }

        /*
         * Firebase autenticou, mas ainda
         * não temos um AppUser válido.
         *
         * Neste caso não redirecionamos
         * às cegas.
         */
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
            appUser.role ===
            USER_ROLES.CLIENT
        ) {
            if (!emailVerified) {
                router.replace(
                    "/verificar-email",
                );

                return;
            }

            router.replace(
                "/cliente",
            );
        }
    }, [
        appUser,
        emailVerified,
        loading,
        router,
        user,
    ]);

    /*
     * Usuário já autenticado.
     *
     * Evita mostrar o formulário
     * brevemente antes do redirect.
     */
    if (
        loading ||
        (user && appUser)
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F7F5EF] px-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />

                    Preparando seu acesso...
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F7F5EF]">
            <div className="mx-auto grid min-h-screen w-full max-w-6xl lg:grid-cols-2">
                <section className="hidden flex-col justify-between bg-[#304229] p-10 text-white lg:flex xl:p-14">
                    <div>
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
                            <Scissors className="size-5" />
                        </div>

                        <p className="mt-8 text-sm font-medium tracking-[0.18em] text-white/70">
                            PRISCILA BARBOSA
                        </p>

                        <h1 className="mt-3 max-w-md text-4xl font-semibold leading-tight">
                            Seu horário de beleza,
                            do seu jeito.
                        </h1>

                        <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
                            Entre na sua conta para solicitar
                            horários e acompanhar seus
                            agendamentos.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-white/70">
                        <CalendarDays className="size-5" />

                        Agendamentos simples e organizados.
                    </div>
                </section>

                <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
                    <div className="w-full max-w-md">
                        <div className="mb-8 lg:hidden">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-[#304229] text-white">
                                <Scissors className="size-5" />
                            </div>
                        </div>

                        <p className="text-sm font-medium tracking-wide text-[#65715F]">
                            PRISCILA BARBOSA ALISAMENTOS
                        </p>

                        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                            Entre na sua conta
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Acesse para solicitar um novo
                            horário ou acompanhar seus
                            agendamentos.
                        </p>

                        <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                            <LoginForm />
                        </div>
                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Ainda não possui uma conta?{" "}
                                <Link
                                    href="/criar-conta"
                                    className="font-semibold text-[#304229] underline-offset-4 hover:underline"
                                >
                                    Criar minha conta
                                </Link>
                            </p>
                        </div>

                        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                            Seu acesso é pessoal e protegido
                            pelo Firebase Authentication.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}