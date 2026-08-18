"use client";

import {
    CalendarCheck2,
    Loader2,
    Scissors,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import {
    useEffect,
} from "react";

import Link from "next/link";

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
         * não temos AppUser válido.
         */
        if (!appUser) {
            return;
        }

        /*
         * ADMIN
         */
        if (
            appUser.role ===
            USER_ROLES.ADMIN
        ) {
            router.replace(
                "/admin",
            );

            return;
        }

        /*
         * CLIENT
         */
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
     * Evita mostrar o formulário
     * rapidamente quando já existe
     * uma sessão autenticada.
     */
    if (
        loading ||
        (user && appUser)
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F7F5EF] px-4">
                <div className="flex flex-col items-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#304229] text-white shadow-sm">
                        <Scissors className="size-5" />
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#687064]">
                        <Loader2 className="size-4 animate-spin" />

                        Preparando seu acesso...
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F7F5EF]">
            <div className="grid min-h-screen w-full lg:grid-cols-[1.08fr_0.92fr]">
                {/* =====================================
                    LATERAL ESQUERDA — DESKTOP
                ===================================== */}
                <section className="relative hidden min-h-screen overflow-hidden lg:flex">
                    {/* IMAGEM DE FUNDO */}
                    <div
                        className="absolute inset-0 scale-[1.02] bg-cover bg-center"
                        style={{
                            backgroundImage:
                                "url('/images/lindsay-cash-Md_DhaFsnCQ-unsplash.jpg')",
                        }}
                    />

                    {/* CAMADA VERDE */}
                    <div className="absolute inset-0 bg-[#26351F]/72" />

                    {/* GRADIENTE */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#172015]/75 via-[#304229]/45 to-[#304229]/75" />

                    {/* PROFUNDIDADE */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />

                    {/* ELEMENTOS DECORATIVOS */}
                    <div className="pointer-events-none absolute -left-32 -top-32 size-[420px] rounded-full bg-white/[0.08] blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-36 -right-28 size-[450px] rounded-full bg-[#C8B58A]/15 blur-3xl" />

                    {/* CONTEÚDO */}
                    <div className="relative z-10 flex min-h-screen w-full flex-col justify-between px-12 py-10 xl:px-16 xl:py-12 2xl:px-20">
                        {/* TOPO */}
                        <div>
                            {/* MARCA */}
                            <div className="flex items-center gap-3">
                                <div className="flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-md">
                                    <Scissors className="size-5" />
                                </div>

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/55">
                                        Studio
                                    </p>

                                    <p className="mt-1 text-sm font-bold tracking-[0.08em] text-white">
                                        PRISCILA BARBOSA
                                    </p>
                                </div>
                            </div>

                            {/* TEXTO PRINCIPAL */}
                            <div className="mt-20 max-w-[560px] xl:mt-24">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-md">
                                    <Sparkles className="size-3.5" />

                                    Seu cuidado começa aqui
                                </div>

                                <h1 className="mt-6 text-[44px] font-semibold leading-[1.06] tracking-[-0.045em] text-white xl:text-[52px]">
                                    Seu horário de beleza,
                                    do seu jeito.
                                </h1>

                                <p className="mt-6 max-w-[470px] text-[15px] leading-7 text-white/75">
                                    Escolha seu serviço,
                                    encontre o melhor horário
                                    e acompanhe seus
                                    agendamentos de forma
                                    simples, rápida e
                                    organizada.
                                </p>

                                {/* BENEFÍCIOS */}
                                <div className="mt-10 grid max-w-[470px] gap-3">
                                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 backdrop-blur-md">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                                            <CalendarCheck2 className="size-4" />
                                        </div>

                                        <p className="text-sm font-medium text-white/85">
                                            Solicite seus horários
                                            online com facilidade
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 backdrop-blur-md">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                                            <ShieldCheck className="size-4" />
                                        </div>

                                        <p className="text-sm font-medium text-white/85">
                                            Acompanhe seus
                                            agendamentos com
                                            segurança
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RODAPÉ */}
                        <div className="flex items-center justify-between border-t border-white/10 pt-6 text-[11px] text-white/55">
                            <span>
                                Priscila Barbosa Alisamentos
                            </span>

                            <span>
                                Florianópolis • SC
                            </span>
                        </div>
                    </div>
                </section>

                {/* =====================================
                    LOGIN
                    MOBILE: FOTO DE FUNDO
                    DESKTOP: FUNDO CLARO
                ===================================== */}
                <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
                    {/* =====================================
                        IMAGEM MOBILE
                    ===================================== */}
                    <div
                        className="absolute inset-0 bg-cover bg-center lg:hidden"
                        style={{
                            backgroundImage:
                                "url('/images/lindsay-cash-Md_DhaFsnCQ-unsplash.jpg')",
                        }}
                    />

                    {/* OVERLAY VERDE MOBILE */}
                    <div className="absolute inset-0 bg-[#23301E]/70 lg:hidden" />

                    {/* GRADIENTE MOBILE */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#182115]/50 via-[#304229]/50 to-[#172015]/80 lg:hidden" />

                    {/* ESCURECIMENTO INFERIOR MOBILE */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 lg:hidden" />

                    {/* =====================================
                        DECORAÇÃO DESKTOP
                    ===================================== */}
                    <div className="pointer-events-none absolute right-[-180px] top-[-180px] hidden size-[420px] rounded-full bg-[#DDE4D8]/45 blur-3xl lg:block" />

                    <div className="pointer-events-none absolute -bottom-56 -left-44 hidden size-[420px] rounded-full bg-[#E8E1D3]/60 blur-3xl lg:block" />

                    {/* =====================================
                        CONTEÚDO
                    ===================================== */}
                    <div className="relative z-10 w-full max-w-[430px]">
                        {/* LOGO MOBILE */}
                        <div className="mb-8 lg:hidden">
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md">
                                    <Scissors className="size-5" />
                                </div>

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                                        Studio
                                    </p>

                                    <p className="mt-0.5 text-sm font-bold tracking-[0.04em] text-white">
                                        PRISCILA BARBOSA
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CABEÇALHO */}
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65 lg:text-[#71806A]">
                                Área da cliente
                            </p>

                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-[34px] lg:text-[#252B23]">
                                Bem-vinda de volta
                            </h2>

                            <p className="mt-3 max-w-sm text-sm leading-6 text-white/75 lg:text-[#777D74]">
                                Entre na sua conta para
                                solicitar um novo horário
                                ou acompanhar seus
                                agendamentos.
                            </p>
                        </div>

                        {/* =====================================
                            FORMULÁRIO
                        ===================================== */}
                        <div className="mt-7 rounded-[24px] border border-white/30 bg-white/[0.96] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-7 lg:mt-8 lg:border-[#E3E4DD] lg:bg-white lg:shadow-[0_12px_40px_rgba(48,66,41,0.08)]">
                            <LoginForm />
                        </div>

                        {/* =====================================
                            CRIAR CONTA
                        ===================================== */}
                        <div className="mt-5 rounded-2xl border border-white/25 bg-white/[0.92] px-4 py-3.5 text-center shadow-[0_10px_30px_rgba(0,0,0,0.10)] backdrop-blur-xl lg:mt-6 lg:border-[#E5E4DD] lg:bg-white/55 lg:shadow-none">
                            <p className="text-sm text-[#72786E]">
                                Ainda não possui uma conta?{" "}

                                <Link
                                    href="/criar-conta"
                                    className="font-bold text-[#304229] transition-colors hover:text-[#506444]"
                                >
                                    Criar minha conta
                                </Link>
                            </p>
                        </div>

                        {/* =====================================
                            SEGURANÇA
                        ===================================== */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-white/65 lg:text-[#92978F]">
                            <ShieldCheck className="size-3.5" />

                            <span>
                                Acesso pessoal e protegido
                            </span>
                        </div>

                        {/* RODAPÉ MOBILE */}
                        <p className="mt-8 text-center text-[11px] text-white/45 lg:hidden">
                            © Priscila Barbosa Alisamentos
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}