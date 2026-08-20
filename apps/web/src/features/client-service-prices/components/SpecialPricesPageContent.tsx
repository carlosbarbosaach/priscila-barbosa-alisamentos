"use client";

import {
    BadgeDollarSign,
    RefreshCw,
    Search,
    Scissors,
    Tags,
    UsersRound,
} from "lucide-react";

import {
    useMemo,
    useState,
} from "react";

import {
    AdminPageHeader,
} from "@/components/admin/AdminPageHeader";

import {
    Button,
} from "@/components/ui/button";

import {
    useSpecialPriceOverview,
} from "@/features/client-service-prices/hooks/useSpecialPriceOverview";

function formatPrice(
    priceCents: number,
) {
    return new Intl.NumberFormat(
        "pt-BR",
        {
            style:
                "currency",

            currency:
                "BRL",
        },
    ).format(
        priceCents / 100,
    );
}

function formatPhone(
    phone: string,
) {
    const digits =
        phone.replace(
            /\D/g,
            "",
        );

    /*
     * Brasil com DDI +55
     *
     * Exemplo:
     * 5548996825149
     * ↓
     * +55 (48) 99682-5149
     */
    if (
        digits.length === 13 &&
        digits.startsWith("55")
    ) {
        const ddi =
            digits.slice(
                0,
                2,
            );

        const ddd =
            digits.slice(
                2,
                4,
            );

        const firstPart =
            digits.slice(
                4,
                9,
            );

        const lastPart =
            digits.slice(
                9,
            );

        return `+${ddi} (${ddd}) ${firstPart}-${lastPart}`;
    }

    /*
     * Brasil com DDI +55
     * telefone fixo.
     */
    if (
        digits.length === 12 &&
        digits.startsWith("55")
    ) {
        const ddi =
            digits.slice(
                0,
                2,
            );

        const ddd =
            digits.slice(
                2,
                4,
            );

        const firstPart =
            digits.slice(
                4,
                8,
            );

        const lastPart =
            digits.slice(
                8,
            );

        return `+${ddi} (${ddd}) ${firstPart}-${lastPart}`;
    }

    /*
     * Celular sem +55
     *
     * 48996825149
     * ↓
     * (48) 99682-5149
     */
    if (
        digits.length === 11
    ) {
        return digits.replace(
            /(\d{2})(\d{5})(\d{4})/,
            "($1) $2-$3",
        );
    }

    /*
     * Telefone fixo sem +55.
     */
    if (
        digits.length === 10
    ) {
        return digits.replace(
            /(\d{2})(\d{4})(\d{4})/,
            "($1) $2-$3",
        );
    }

    return phone;

}

function normalizeSearch(
    value: string,
) {
    return value
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            "",
        )
        .toLowerCase()
        .trim();
}

export function SpecialPricesPageContent() {
    const [
        search,
        setSearch,
    ] =
        useState("");

    const [
        serviceId,
        setServiceId,
    ] =
        useState("all");

    const {
        data,
        isLoading,
        isError,
        isFetching,
        refetch,
    } =
        useSpecialPriceOverview();

    /*
     * Serviços que realmente possuem
     * algum preço especial ativo.
     */
    const services =
        useMemo(
            () => {
                if (!data) {
                    return [];
                }

                const map =
                    new Map<
                        string,
                        string
                    >();

                for (
                    const price
                    of data.prices
                ) {
                    map.set(
                        price.serviceId,
                        price.serviceName,
                    );
                }

                return Array.from(
                    map.entries(),
                )
                    .map(
                        ([
                            id,
                            name,
                        ]) => ({
                            id,
                            name,
                        }),
                    )
                    .sort(
                        (
                            first,
                            second,
                        ) =>
                            first.name.localeCompare(
                                second.name,
                                "pt-BR",
                            ),
                    );
            },
            [
                data,
            ],
        );

    /*
     * Busca local.
     *
     * Não faz nova consulta no Firebase
     * enquanto a ADMIN digita.
     */
    const filteredPrices =
        useMemo(
            () => {
                if (!data) {
                    return [];
                }

                const normalizedSearch =
                    normalizeSearch(
                        search,
                    );

                const digitsSearch =
                    search.replace(
                        /\D/g,
                        "",
                    );

                return data.prices.filter(
                    (
                        price,
                    ) => {
                        const matchesService =
                            serviceId ===
                            "all" ||
                            price.serviceId ===
                            serviceId;

                        if (
                            !matchesService
                        ) {
                            return false;
                        }

                        if (
                            !normalizedSearch
                        ) {
                            return true;
                        }

                        const normalizedName =
                            normalizeSearch(
                                price.clientName,
                            );

                        const phoneDigits =
                            price.clientPhone.replace(
                                /\D/g,
                                "",
                            );

                        const matchesName =
                            normalizedName.includes(
                                normalizedSearch,
                            );

                        const matchesPhone =
                            digitsSearch.length >
                            0 &&
                            phoneDigits.includes(
                                digitsSearch,
                            );

                        return (
                            matchesName ||
                            matchesPhone
                        );
                    },
                );
            },
            [
                data,
                search,
                serviceId,
            ],
        );

    function clearFilters() {
        setSearch(
            "",
        );

        setServiceId(
            "all",
        );
    }

    const hasFilters =
        search.trim().length >
        0 ||
        serviceId !==
        "all";

    return (
        <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
            {/* CABEÇALHO */}
            <AdminPageHeader
                eyebrow="Administração"
                title="Preços especiais"
                description="Consulte as clientes que possuem valores especiais cadastrados para os serviços do salão."
                badgeLabel="Valores personalizados"
                badgeIcon={BadgeDollarSign}
            />

            {/* CARDS DE RESUMO */}
            {isLoading ? (
                <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map(
                        (
                            item,
                        ) => (
                            <div
                                key={
                                    item
                                }
                                className="h-[125px] animate-pulse rounded-2xl border border-[#E3E7E0] bg-white"
                            />
                        ),
                    )}
                </section>
            ) : (
                data && (
                    <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <SummaryCard
                            label="Clientes com preço especial"
                            value={
                                data
                                    .summary
                                    .clientsWithSpecialPrice
                            }
                            description={
                                data
                                    .summary
                                    .clientsWithSpecialPrice ===
                                    1
                                    ? "cliente com condição especial"
                                    : "clientes com condição especial"
                            }
                            icon={
                                UsersRound
                            }
                        />

                        <SummaryCard
                            label="Preços especiais ativos"
                            value={
                                data
                                    .summary
                                    .activeSpecialPrices
                            }
                            description="Condições especiais atualmente ativas"
                            icon={
                                Tags
                            }
                        />

                        <SummaryCard
                            label="Serviços envolvidos"
                            value={
                                data
                                    .summary
                                    .servicesWithSpecialPrice
                            }
                            description="Serviços com pelo menos um preço especial"
                            icon={
                                Scissors
                            }
                        />
                    </section>
                )
            )}

            {/* ERRO */}
            {isError && (
                <section className="mt-5 rounded-2xl border border-[#E8D4CF] bg-[#FFF9F7] p-5">
                    <p className="text-sm font-semibold text-[#984B3E]">
                        Não foi possível
                        carregar os preços
                        especiais.
                    </p>

                    <p className="mt-1 text-sm text-[#78635E]">
                        Verifique a
                        conexão com a API
                        e tente novamente.
                    </p>

                    <Button
                        type="button"
                        variant="outline"
                        disabled={
                            isFetching
                        }
                        className="mt-4"
                        onClick={() =>
                            void refetch()
                        }
                    >
                        <RefreshCw
                            className={[
                                "mr-2 size-4",
                                isFetching
                                    ? "animate-spin"
                                    : "",
                            ].join(
                                " ",
                            )}
                        />

                        Tentar novamente
                    </Button>
                </section>
            )}

            {data &&
                !isLoading &&
                !isError && (
                    <>
                        {/* FILTROS */}
                        <section className="mt-5 rounded-2xl border border-[#E3E7E0] bg-white p-4 shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                                {/* BUSCA */}
                                <label className="flex-1">
                                    <span className="text-xs font-medium text-[#73776D]">
                                        Buscar
                                        cliente
                                    </span>

                                    <div className="relative mt-1.5">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#91968D]" />

                                        <input
                                            type="search"
                                            value={
                                                search
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setSearch(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="Nome ou telefone..."
                                            className="h-10 w-full rounded-xl border border-[#DDE2DA] bg-white pl-10 pr-3 text-sm text-[#293027] outline-none transition placeholder:text-[#A1A69D] focus:border-[#304229] focus:ring-2 focus:ring-[#304229]/10"
                                        />
                                    </div>
                                </label>

                                {/* SERVIÇO */}
                                <label className="w-full lg:w-[280px]">
                                    <span className="text-xs font-medium text-[#73776D]">
                                        Serviço
                                    </span>

                                    <select
                                        value={
                                            serviceId
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setServiceId(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className="mt-1.5 h-10 w-full rounded-xl border border-[#DDE2DA] bg-white px-3 text-sm text-[#293027] outline-none transition focus:border-[#304229] focus:ring-2 focus:ring-[#304229]/10"
                                    >
                                        <option value="all">
                                            Todos
                                            os
                                            serviços
                                        </option>

                                        {services.map(
                                            (
                                                service,
                                            ) => (
                                                <option
                                                    key={
                                                        service.id
                                                    }
                                                    value={
                                                        service.id
                                                    }
                                                >
                                                    {
                                                        service.name
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </label>

                                {hasFilters && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={
                                            clearFilters
                                        }
                                        className="border-[#DDD6C9] text-[#596454]"
                                    >
                                        Limpar
                                        filtros
                                    </Button>
                                )}
                            </div>
                        </section>

                        {/* TABELA */}
                        <section className="mt-5 overflow-hidden rounded-2xl border border-[#E3E7E0] bg-white shadow-sm">
                            {/* CABEÇALHO DA TABELA */}
                            <div className="flex flex-col gap-2 border-b border-[#E8EBE5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="font-semibold text-[#293027]">
                                        Clientes
                                        com
                                        preços
                                        especiais
                                    </h2>

                                    <p className="mt-1 text-sm text-[#73776D]">
                                        Valores
                                        especiais
                                        ativos
                                        cadastrados
                                        no
                                        sistema.
                                    </p>
                                </div>

                                <span className="shrink-0 rounded-full bg-[#EEF2EB] px-3 py-1.5 text-xs font-semibold text-[#53644A]">
                                    {
                                        filteredPrices.length
                                    }{" "}
                                    {filteredPrices.length ===
                                        1
                                        ? "registro"
                                        : "registros"}
                                </span>
                            </div>

                            {/* SEM PREÇOS */}
                            {data.prices
                                .length ===
                                0 && (
                                    <div className="px-6 py-16 text-center">
                                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#F1EBDD] text-[#465B36]">
                                            <BadgeDollarSign className="size-5" />
                                        </div>

                                        <h3 className="mt-4 font-semibold text-[#293027]">
                                            Nenhum
                                            preço
                                            especial
                                            cadastrado
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#73776D]">
                                            Quando
                                            uma
                                            cliente
                                            possuir
                                            uma
                                            condição
                                            especial,
                                            ela
                                            aparecerá
                                            aqui.
                                        </p>
                                    </div>
                                )}

                            {/* FILTRO SEM RESULTADO */}
                            {data.prices
                                .length >
                                0 &&
                                filteredPrices
                                    .length ===
                                0 && (
                                    <div className="px-6 py-16 text-center">
                                        <Search className="mx-auto size-7 text-[#9CA297]" />

                                        <h3 className="mt-4 font-semibold text-[#293027]">
                                            Nenhum
                                            resultado
                                        </h3>

                                        <p className="mt-2 text-sm text-[#73776D]">
                                            Nenhum
                                            preço
                                            especial
                                            corresponde
                                            aos
                                            filtros
                                            selecionados.
                                        </p>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="mt-4"
                                            onClick={
                                                clearFilters
                                            }
                                        >
                                            Limpar
                                            filtros
                                        </Button>
                                    </div>
                                )}

                            {/* TABELA REAL */}
                            {filteredPrices
                                .length >
                                0 && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[980px] border-collapse">
                                            <thead>
                                                <tr className="border-b border-[#E8EBE5] bg-[#F8FAF7]">
                                                    <TableHeader>
                                                        Cliente
                                                    </TableHeader>

                                                    <TableHeader>
                                                        Telefone
                                                    </TableHeader>

                                                    <TableHeader>
                                                        Serviço
                                                    </TableHeader>

                                                    <TableHeader align="right">
                                                        Preço
                                                        padrão
                                                    </TableHeader>

                                                    <TableHeader align="right">
                                                        Preço
                                                        especial
                                                    </TableHeader>

                                                    <TableHeader align="right">
                                                        Economia
                                                    </TableHeader>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {filteredPrices.map(
                                                    (
                                                        price,
                                                    ) => (
                                                        <tr
                                                            key={
                                                                price.id
                                                            }
                                                            className="border-b border-[#EDF0EB] transition last:border-b-0 hover:bg-[#FBFCFA]"
                                                        >
                                                            {/* CLIENTE */}
                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2EB] text-sm font-bold text-[#53644A]">
                                                                        {price.clientName
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </div>

                                                                    <div className="min-w-0">
                                                                        <p className="max-w-[230px] truncate text-sm font-semibold text-[#293027]">
                                                                            {
                                                                                price.clientName
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* TELEFONE */}
                                                            <td className="px-5 py-4 text-sm text-[#62685E]">
                                                                {formatPhone(
                                                                    price.clientPhone,
                                                                )}
                                                            </td>

                                                            {/* SERVIÇO */}
                                                            <td className="px-5 py-4">
                                                                <span className="inline-flex items-center gap-2 rounded-lg bg-[#F4F1E8] px-2.5 py-1.5 text-sm font-medium text-[#665D44]">
                                                                    <Scissors className="size-3.5" />

                                                                    {
                                                                        price.serviceName
                                                                    }
                                                                </span>
                                                            </td>

                                                            {/* PADRÃO */}
                                                            <td className="px-5 py-4 text-right text-sm font-medium text-[#73776D]">
                                                                {formatPrice(
                                                                    price.defaultPriceCents,
                                                                )}
                                                            </td>

                                                            {/* ESPECIAL */}
                                                            <td className="px-5 py-4 text-right">
                                                                <span className="text-sm font-bold text-[#304229]">
                                                                    {formatPrice(
                                                                        price.specialPriceCents,
                                                                    )}
                                                                </span>
                                                            </td>

                                                            {/* ECONOMIA */}
                                                            <td className="px-5 py-4 text-right">
                                                                <span className="inline-flex rounded-full bg-[#EDF5EA] px-2.5 py-1 text-xs font-semibold text-[#36542E]">
                                                                    {formatPrice(
                                                                        price.differenceCents,
                                                                    )}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                        </section>
                    </>
                )}
        </main>
    );
}

type SummaryCardProps = {
    label:
    string;

    value:
    number;

    description:
    string;

    icon:
    typeof UsersRound;
};

function SummaryCard({
    label,
    value,
    description,
    icon: Icon,
}: SummaryCardProps) {
    return (
        <article className="rounded-2xl border border-[#E3E7E0] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-medium text-[#73776D]">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-[#293027]">
                        {value}
                    </p>
                </div>

                <div className="flex size-10 items-center justify-center rounded-xl bg-[#EEF2EB] text-[#53644A]">
                    <Icon className="size-[18px]" />
                </div>
            </div>

            <p className="mt-3 text-xs text-[#858A81]">
                {description}
            </p>
        </article>
    );
}

type TableHeaderProps = {
    children:
    React.ReactNode;

    align?:
    "left" |
    "right";
};

function TableHeader({
    children,
    align = "left",
}: TableHeaderProps) {
    return (
        <th
            className={[
                "px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#858B81]",
                align ===
                    "right"
                    ? "text-right"
                    : "text-left",
            ].join(
                " ",
            )}
        >
            {children}
        </th>
    );
}