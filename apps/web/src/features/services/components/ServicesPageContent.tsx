"use client";

import {
    SERVICE_PRICE_TYPES,
} from "@priscila/shared";

import {
    CalendarDays,
    Flame,
    RefreshCw,
    Scissors,
} from "lucide-react";

import {
    AdminPageHeader,
} from "@/components/admin/AdminPageHeader";

import {
    Button,
} from "@/components/ui/button";

import {
    CreateServiceDialog,
} from "./CreateServiceDialog";

import {
    EditServiceDialog,
} from "./EditServiceDialog";

import {
    ServicePromotionDialog,
} from "./ServicePromotionDialog";

import {
    ServiceStatusButton,
} from "./ServiceStatusButton";

import {
    useServices,
} from "@/features/services/hooks/useServices";

function formatPrice(
    priceInCents:
        number,
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
        priceInCents /
            100,
    );
}

function formatDateOnly(
    value:
        string,
) {
    const [
        year,
        month,
        day,
    ] =
        value.split("-");

    if (
        !year ||
        !month ||
        !day
    ) {
        return value;
    }

    return `${day}/${month}/${year}`;
}

export function ServicesPageContent() {
    const {
        data:
        services = [],

        isLoading,

        isError,

        refetch,
    } =
        useServices();

    return (
        <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
            {/* ==============================
                CABEÇALHO
            ============================== */}
            <AdminPageHeader
                eyebrow="Administração"
                title="Serviços"
                description="Gerencie os serviços oferecidos pelo salão e seus respectivos preços."
                rightContent={
                    <CreateServiceDialog />
                }
            />

            {/* ==============================
                CONTEÚDO
            ============================== */}
            <section className="mt-7">
                {/* LOADING */}
                {isLoading && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                        {[
                            1,
                            2,
                            3,
                            4,
                        ].map(
                            (
                                item,
                            ) => (
                                <div
                                    key={
                                        item
                                    }
                                    className="h-[220px] animate-pulse rounded-2xl border border-[#E5E9E2] bg-white"
                                />
                            ),
                        )}
                    </div>
                )}

                {/* ERRO */}
                {isError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                        <p className="text-sm font-medium text-red-700">
                            Não foi possível carregar os serviços.
                        </p>

                        <Button
                            type="button"
                            variant="outline"
                            className="mt-4"
                            onClick={() =>
                                void refetch()
                            }
                        >
                            <RefreshCw className="mr-2 size-4" />

                            Tentar novamente
                        </Button>
                    </div>
                )}

                {/* VAZIO */}
                {!isLoading &&
                    !isError &&
                    services.length ===
                        0 && (
                        <div className="rounded-2xl border bg-white p-8 text-center">
                            <Scissors className="mx-auto size-8 text-muted-foreground" />

                            <h2 className="mt-4 font-semibold">
                                Nenhum serviço cadastrado
                            </h2>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Clique em &quot;Novo serviço&quot; para fazer o primeiro cadastro.
                            </p>
                        </div>
                    )}

                {/* SERVIÇOS */}
                {!isLoading &&
                    !isError &&
                    services.length >
                        0 && (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                            {services.map(
                                (
                                    service,
                                ) => {
                                    const isStartingFrom =
                                        service
                                            .priceType ===
                                        SERVICE_PRICE_TYPES
                                            .STARTING_FROM;

                                    /*
                                     * promotionIsActive representa
                                     * somente o estado administrativo
                                     * da promoção.
                                     *
                                     * A validade por data será tratada
                                     * na regra central de preço.
                                     */
                                    const promotionIsActive =
                                        service
                                            .promotionActive &&
                                        service
                                            .promotionPriceCents !==
                                            null;

                                    const hasPromotionPeriod =
                                        service
                                            .promotionStartsOn !==
                                            null &&
                                        service
                                            .promotionEndsOn !==
                                            null;

                                    return (
                                        <article
                                            key={
                                                service
                                                    .id
                                            }
                                            className="
                                                rounded-2xl
                                                border
                                                border-[#E3E7E0]
                                                bg-white
                                                p-4
                                                shadow-[0_2px_8px_rgba(48,66,41,0.04)]
                                                transition-all
                                                duration-200
                                                hover:-translate-y-0.5
                                                hover:border-[#CBD4C6]
                                                hover:shadow-[0_6px_18px_rgba(48,66,41,0.08)]
                                            "
                                        >
                                            {/* ==============================
                                                TOPO
                                            ============================== */}
                                            <div className="flex min-w-0 items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94998F]">
                                                        Serviço
                                                    </p>

                                                    <h2 className="mt-1 truncate text-[17px] font-semibold text-[#242A22]">
                                                        {
                                                            service
                                                                .name
                                                        }
                                                    </h2>
                                                </div>

                                                <div className="flex shrink-0 flex-col items-end gap-1.5">
                                                    <span
                                                        className={
                                                            service
                                                                .active
                                                                ? `
                                                                    rounded-full
                                                                    bg-[#E8F1E5]
                                                                    px-2.5
                                                                    py-1
                                                                    text-[11px]
                                                                    font-semibold
                                                                    text-[#3F6337]
                                                                `
                                                                : `
                                                                    rounded-full
                                                                    bg-zinc-100
                                                                    px-2.5
                                                                    py-1
                                                                    text-[11px]
                                                                    font-semibold
                                                                    text-zinc-600
                                                                `
                                                        }
                                                    >
                                                        {service
                                                            .active
                                                            ? "Ativo"
                                                            : "Inativo"}
                                                    </span>

                                                    {promotionIsActive && (
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-[#E9D39E] bg-[#FFF7DF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#755819]">
                                                            <Flame className="size-3" />

                                                            {service
                                                                .promotionLabel ??
                                                                "Promoção"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ==============================
                                                PREÇO
                                            ============================== */}
                                            <div className="mt-5">
                                                {promotionIsActive ? (
                                                    <div className="rounded-xl border border-[#E9DAB8] bg-[#FFFBF1] p-3">
                                                        <div className="flex flex-wrap items-end justify-between gap-3">
                                                            <div>
                                                                <p className="text-[11px] font-medium text-[#8A8171]">
                                                                    {isStartingFrom
                                                                        ? "Valor inicial normal"
                                                                        : "Preço normal"}
                                                                </p>

                                                                <p className="mt-0.5 text-sm font-medium text-[#8A8171] line-through">
                                                                    {isStartingFrom &&
                                                                        "A partir de "}

                                                                    {formatPrice(
                                                                        service
                                                                            .defaultPriceCents,
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <div className="text-right">
                                                                <p className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#80601B]">
                                                                    <Flame className="size-3" />

                                                                    Promoção
                                                                </p>

                                                                {isStartingFrom && (
                                                                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#80601B]">
                                                                        A partir de
                                                                    </p>
                                                                )}

                                                                <p className="text-xl font-bold tracking-tight text-[#6B5016]">
                                                                    {formatPrice(
                                                                        service
                                                                            .promotionPriceCents!,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {hasPromotionPeriod && (
                                                            <div className="mt-3 border-t border-[#EEE1C3] pt-3">
                                                                <p className="flex items-center gap-1.5 text-xs font-medium text-[#80601B]">
                                                                    <CalendarDays className="size-3.5 shrink-0" />

                                                                    <span>
                                                                        {formatDateOnly(
                                                                            service
                                                                                .promotionStartsOn!,
                                                                        )}

                                                                        {" até "}

                                                                        {formatDateOnly(
                                                                            service
                                                                                .promotionEndsOn!,
                                                                        )}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {isStartingFrom
                                                                ? "Valor inicial"
                                                                : "Preço"}
                                                        </p>

                                                        {isStartingFrom ? (
                                                            <div className="mt-0.5">
                                                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6D7868]">
                                                                    A partir de
                                                                </p>

                                                                <p className="text-xl font-bold tracking-tight text-[#304229]">
                                                                    {formatPrice(
                                                                        service
                                                                            .defaultPriceCents,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <p className="mt-0.5 text-xl font-bold tracking-tight text-[#304229]">
                                                                {formatPrice(
                                                                    service
                                                                        .defaultPriceCents,
                                                                )}
                                                            </p>
                                                        )}

                                                        {!promotionIsActive &&
                                                            hasPromotionPeriod &&
                                                            service
                                                                .promotionPriceCents !==
                                                                null && (
                                                                <div className="mt-3 rounded-xl border border-[#E7E7E2] bg-[#FAFAF8] px-3 py-2.5">
                                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#858A80]">
                                                                        Última promoção
                                                                    </p>

                                                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#6F756B]">
                                                                        <CalendarDays className="size-3.5 shrink-0" />

                                                                        {formatDateOnly(
                                                                            service
                                                                                .promotionStartsOn!,
                                                                        )}

                                                                        {" até "}

                                                                        {formatDateOnly(
                                                                            service
                                                                                .promotionEndsOn!,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* ==============================
                                                AÇÕES
                                            ============================== */}
                                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#EEF0EC] pt-4">
                                                <ServicePromotionDialog
                                                    service={
                                                        service
                                                    }
                                                />

                                                <EditServiceDialog
                                                    service={
                                                        service
                                                    }
                                                />

                                                <ServiceStatusButton
                                                    service={
                                                        service
                                                    }
                                                />
                                            </div>
                                        </article>
                                    );
                                },
                            )}
                        </div>
                    )}
            </section>
        </main>
    );
}