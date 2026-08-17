"use client";

import {
    USER_ROLES,
} from "@priscila/shared";

import {
    Loader2,
    Scissors,
    ShieldCheck,
} from "lucide-react";

import {
    useEffect,
} from "react";

import Link from "next/link";

import {
    useRouter,
} from "next/navigation";

import {
    RegisterForm,
} from "@/features/auth/components/RegisterForm";

import {
    useAuth,
} from "@/features/auth/hooks/useAuth";

export default function RegisterPage() {
    const router =
        useRouter();

    const {
        user,
        appUser,
        emailVerified,
        loading,
    } = useAuth();

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!user) {
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
            appUser.role ===
            USER_ROLES.CLIENT
        ) {
            /*
             * Conta por e-mail/senha
             * recém-criada.
             */
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

    if (
        loading ||
        (user && appUser)
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F7F5EF] px-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />

                    Preparando sua conta...
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
                            Crie sua conta e cuide
                            dos seus agendamentos.
                        </h1>

                        <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
                            Tenha um acesso pessoal para
                            solicitar horários e acompanhar
                            seus atendimentos no salão.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-white/70">
                        <ShieldCheck className="size-5" />

                        Sua conta é protegida pelo Firebase Authentication.
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
                            Crie sua conta
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Informe seus dados para criar
                            seu acesso pessoal ao sistema
                            de agendamentos.
                        </p>

                        <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                            <RegisterForm />
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Já possui uma conta?{" "}
                                <Link
                                    href="/entrar"
                                    className="font-semibold text-[#304229] underline-offset-4 hover:underline"
                                >
                                    Entrar
                                </Link>
                            </p>
                        </div>

                        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
                            A senha é armazenada e protegida
                            pelo Firebase Authentication.
                            O salão não possui acesso à sua senha.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}