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
     * não temos um AppUser válido.
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
   * Evita mostrar rapidamente
   * o formulário quando já existe
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
      <div className="grid min-h-screen w-full lg:grid-cols-[0.92fr_1.08fr]">
        {/* =====================================
            APRESENTAÇÃO / DESKTOP
        ===================================== */}
        <section className="relative hidden min-h-screen overflow-hidden bg-[#304229] text-white lg:flex lg:flex-col lg:justify-between">
          {/* DETALHES DECORATIVOS */}
          <div className="pointer-events-none absolute -left-32 -top-32 size-[420px] rounded-full bg-white/[0.04] blur-2xl" />

          <div className="pointer-events-none absolute -bottom-40 -right-28 size-[460px] rounded-full bg-[#91A181]/10 blur-3xl" />

          <div className="pointer-events-none absolute right-[-80px] top-[30%] size-[240px] rounded-full border border-white/[0.06]" />

          {/* CONTEÚDO SUPERIOR */}
          <div className="relative z-10 p-10 xl:p-14 2xl:p-16">
            {/* MARCA */}
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur">
                <Scissors className="size-5" />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
                  Studio
                </p>

                <p className="mt-0.5 text-sm font-semibold tracking-[0.08em]">
                  PRISCILA BARBOSA
                </p>
              </div>
            </div>

            {/* TEXTO PRINCIPAL */}
            <div className="mt-20 max-w-lg xl:mt-24">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-white/75">
                <Sparkles className="size-3.5" />

                Sua beleza merece organização
              </div>

              <h1 className="mt-6 text-[42px] font-semibold leading-[1.08] tracking-[-0.035em] xl:text-5xl">
                Seu momento de cuidado começa
                antes mesmo de chegar ao salão.
              </h1>

              <p className="mt-6 max-w-md text-[15px] leading-7 text-white/65">
                Escolha seu serviço, encontre
                o melhor horário e acompanhe
                seus agendamentos de forma
                simples e segura.
              </p>
            </div>

            {/* BENEFÍCIOS */}
            <div className="mt-12 grid max-w-lg gap-3">
              <div className="flex items-center gap-3 text-sm text-white/75">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08]">
                  <CalendarCheck2 className="size-4" />
                </div>

                Solicite seus horários online
              </div>

              <div className="flex items-center gap-3 text-sm text-white/75">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08]">
                  <ShieldCheck className="size-4" />
                </div>

                Acompanhe seus agendamentos
                com segurança
              </div>
            </div>
          </div>

          {/* RODAPÉ ESQUERDO */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/[0.07] px-10 py-7 text-xs text-white/45 xl:px-14 2xl:px-16">
            <span>
              Priscila Barbosa Alisamentos
            </span>

            <span>
              Florianópolis • SC
            </span>
          </div>
        </section>

        {/* =====================================
            LOGIN
        ===================================== */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
          {/* FUNDO */}
          <div className="pointer-events-none absolute right-[-180px] top-[-180px] size-[420px] rounded-full bg-[#DDE4D8]/45 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-56 -left-44 size-[420px] rounded-full bg-[#E8E1D3]/60 blur-3xl" />

          <div className="relative z-10 w-full max-w-[430px]">
            {/* LOGO MOBILE */}
            <div className="mb-10 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#304229] text-white shadow-sm">
                  <Scissors className="size-5" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A9284]">
                    Studio
                  </p>

                  <p className="text-sm font-bold tracking-[0.04em] text-[#304229]">
                    PRISCILA BARBOSA
                  </p>
                </div>
              </div>
            </div>

            {/* CABEÇALHO */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#71806A]">
                Área da cliente
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#252B23] sm:text-[34px]">
                Bem-vinda de volta
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-[#777D74]">
                Entre na sua conta para
                solicitar um horário ou
                acompanhar seus agendamentos.
              </p>
            </div>

            {/* FORMULÁRIO */}
            <div className="mt-8 rounded-[24px] border border-[#E3E4DD] bg-white p-5 shadow-[0_10px_35px_rgba(48,66,41,0.07)] sm:p-7">
              <LoginForm />
            </div>

            {/* CRIAR CONTA */}
            <div className="mt-6 rounded-2xl border border-[#E5E4DD] bg-white/50 px-4 py-3.5 text-center backdrop-blur">
              <p className="text-sm text-[#72786E]">
                Ainda não possui uma conta?{" "}

                <Link
                  href="/criar-conta"
                  className="font-bold text-[#304229] transition hover:text-[#506444]"
                >
                  Criar minha conta
                </Link>
              </p>
            </div>

            {/* SEGURANÇA */}
            <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-[#92978F]">
              <ShieldCheck className="size-3.5" />

              <span>
                Acesso pessoal e protegido
              </span>
            </div>

            {/* MOBILE FOOTER */}
            <p className="mt-10 text-center text-[11px] text-[#A0A49D] lg:hidden">
              © Priscila Barbosa Alisamentos
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}