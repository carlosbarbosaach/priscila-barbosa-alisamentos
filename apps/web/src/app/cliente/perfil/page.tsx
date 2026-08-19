"use client";

import {
    BadgeCheck,
    Mail,
    Phone,
    ShieldCheck,
    UserRound,
} from "lucide-react";

import {
    useAuth,
} from "@/features/auth/hooks/useAuth";

/*
 * Formata telefone brasileiro
 * para exibição.
 *
 * Exemplos:
 *
 * 5548996825149
 * ↓
 * +55 (48) 99682-5149
 *
 * 48996825149
 * ↓
 * +55 (48) 99682-5149
 */
function formatBrazilPhone(
    phone: string,
) {
    const digits =
        phone.replace(
            /\D/g,
            "",
        );

    /*
     * Número com código do Brasil:
     *
     * 55 + DDD + celular
     */
    if (
        digits.length === 13 &&
        digits.startsWith("55")
    ) {
        const countryCode =
            digits.slice(
                0,
                2,
            );

        const areaCode =
            digits.slice(
                2,
                4,
            );

        const firstPart =
            digits.slice(
                4,
                9,
            );

        const secondPart =
            digits.slice(
                9,
                13,
            );

        return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
    }

    /*
     * Número sem +55:
     *
     * DDD + celular
     */
    if (
        digits.length === 11
    ) {
        const areaCode =
            digits.slice(
                0,
                2,
            );

        const firstPart =
            digits.slice(
                2,
                7,
            );

        const secondPart =
            digits.slice(
                7,
                11,
            );

        return `+55 (${areaCode}) ${firstPart}-${secondPart}`;
    }

    /*
     * Telefone fixo com +55.
     */
    if (
        digits.length === 12 &&
        digits.startsWith("55")
    ) {
        const countryCode =
            digits.slice(
                0,
                2,
            );

        const areaCode =
            digits.slice(
                2,
                4,
            );

        const firstPart =
            digits.slice(
                4,
                8,
            );

        const secondPart =
            digits.slice(
                8,
                12,
            );

        return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
    }

    /*
     * Telefone fixo sem +55.
     */
    if (
        digits.length === 10
    ) {
        const areaCode =
            digits.slice(
                0,
                2,
            );

        const firstPart =
            digits.slice(
                2,
                6,
            );

        const secondPart =
            digits.slice(
                6,
                10,
            );

        return `+55 (${areaCode}) ${firstPart}-${secondPart}`;
    }

    /*
     * Caso exista algum número
     * antigo fora do padrão,
     * não quebramos a tela.
     */
    return phone;
}

export default function ClientProfilePage() {
    const {
        user,
        appUser,
        clientLink,
    } =
        useAuth();

    const client =
        clientLink?.client;

    const name =
        client?.name ??
        appUser?.displayName ??
        user?.displayName ??
        "Cliente";

    const email =
        client?.email ??
        user?.email ??
        "Não informado";

    /*
     * Telefone original vindo
     * do cadastro da cliente.
     */
    const rawPhone =
        client?.phone ??
        "";

    /*
     * Telefone formatado apenas
     * para exibição.
     *
     * Não altera o valor salvo
     * no banco.
     */
    const phone =
        rawPhone
            ? formatBrazilPhone(
                rawPhone,
            )
            : "Não informado";

    /*
     * Iniciais para o avatar.
     *
     * Ex:
     *
     * Priscila Barbosa
     * ↓
     * PB
     */
    const initials =
        name
            .split(" ")
            .filter(
                Boolean,
            )
            .slice(
                0,
                2,
            )
            .map(
                (
                    part,
                ) =>
                    part
                        .charAt(
                            0,
                        )
                        .toUpperCase(),
            )
            .join("");

    return (
        <div className="space-y-7">
            {/* CABEÇALHO */}
            <section>
                <div className="flex items-center gap-2">
                    <UserRound className="size-4 text-[#7A8075]" />

                    <p className="text-sm font-medium text-[#7A8075]">
                        Sua conta
                    </p>
                </div>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#263620] sm:text-3xl">
                    Meu perfil
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71776D] sm:text-base">
                    Consulte seus dados cadastrados
                    e as informações vinculadas à
                    sua conta.
                </p>
            </section>

            {/* PERFIL PRINCIPAL */}
            <section className="overflow-hidden rounded-3xl border border-[#DDE3D9] bg-white shadow-sm">
                {/* CABEÇALHO DO CARD */}
                <div className="relative overflow-hidden bg-[#304229] px-6 py-7 sm:px-8 sm:py-8">
                    {/* DECORAÇÃO */}
                    <div className="pointer-events-none absolute -right-14 -top-20 size-52 rounded-full bg-white/5" />

                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            {/* AVATAR */}
                            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-xl font-bold text-white shadow-sm backdrop-blur-sm sm:size-[72px]">
                                {initials || (
                                    <UserRound className="size-7" />
                                )}
                            </div>

                            {/* IDENTIFICAÇÃO */}
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                                    Cliente
                                </p>

                                <h2 className="mt-1 truncate text-xl font-bold text-white sm:text-2xl">
                                    {name}
                                </h2>

                                <div className="mt-2 flex items-center gap-1.5 text-sm text-white/70">
                                    <BadgeCheck className="size-4" />

                                    Conta vinculada
                                </div>
                            </div>
                        </div>

                        {/* STATUS */}
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                            <span className="size-2 rounded-full bg-[#BFD3B4]" />

                            Cadastro ativo
                        </span>
                    </div>
                </div>

                {/* INFORMAÇÕES */}
                <div className="p-5 sm:p-7">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#92978E]">
                            Informações pessoais
                        </p>

                        <p className="mt-1 text-sm leading-6 text-[#71776D]">
                            Dados utilizados para identificar
                            sua conta no salão.
                        </p>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {/* E-MAIL */}
                        <div className="rounded-2xl border border-[#E8E3D9] bg-[#FBFAF7] p-4 sm:p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF1EA] text-[#304229]">
                                    <Mail className="size-[18px]" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#92978E]">
                                        E-mail
                                    </p>

                                    <p className="mt-1 break-all text-sm font-semibold leading-6 text-[#394035]">
                                        {email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* WHATSAPP */}
                        <div className="rounded-2xl border border-[#E8E3D9] bg-[#FBFAF7] p-4 sm:p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF1EA] text-[#304229]">
                                    <Phone className="size-[18px]" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#92978E]">
                                        WhatsApp
                                    </p>

                                    <p className="mt-1 text-sm font-semibold leading-6 text-[#394035]">
                                        {phone}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SOMENTE CONSULTA */}
            <section className="rounded-3xl border border-[#E5E0D5] bg-[#FBFAF7] p-5 sm:p-6">
                <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF1EA] text-[#304229]">
                        <ShieldCheck className="size-[18px]" />
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-[#394035]">
                            Seus dados estão protegidos
                        </h3>

                        <p className="mt-1 max-w-2xl text-sm leading-6 text-[#71776D]">
                            Esta área é apenas para consulta.
                            Os dados exibidos estão vinculados
                            ao seu cadastro no salão.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}