"use client";

import {
    SERVICE_PRICE_TYPES,
} from "@priscila/shared";

import {
    RefreshCw,
    Scissors,
} from "lucide-react";

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
    ServiceStatusButton,
} from "./ServiceStatusButton";

import {
    useServices,
} from "@/features/services/hooks/useServices";

function formatPrice(
    priceInCents: number,
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
        priceInCents / 100,
    );
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
            <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-[#304229] text-white">
                            <Scissors className="size-5" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Administração
                            </p>

                            <h1 className="text-2xl font-semibold">
                                Serviços
                            </h1>
                        </div>
                    </div>

                    <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                        Gerencie os serviços oferecidos
                        pelo salão e seus respectivos
                        preços.
                    </p>
                </div>

                <CreateServiceDialog />
            </header>

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
                                    className="h-[145px] animate-pulse rounded-2xl border border-[#E5E9E2] bg-white"
                                />
                            ),
                        )}
                    </div>
                )}

                {/* ERRO */}
                {isError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                        <p className="text-sm font-medium text-red-700">
                            Não foi possível carregar os
                            serviços.
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
                                Clique em &quot;Novo serviço&quot;
                                para fazer o primeiro cadastro.
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
                                        service.priceType ===
                                        SERVICE_PRICE_TYPES
                                            .STARTING_FROM;

                                    return (
                                        <article
                                            key={
                                                service.id
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
                                            {/* TOPO */}
                                            <div className="flex min-w-0 items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94998F]">
                                                        Serviço
                                                    </p>

                                                    <h2 className="mt-1 truncate text-[17px] font-semibold text-[#242A22]">
                                                        {
                                                            service.name
                                                        }
                                                    </h2>
                                                </div>

                                                <span
                                                    className={
                                                        service.active
                                                            ? `
                                                                shrink-0
                                                                rounded-full
                                                                bg-[#E8F1E5]
                                                                px-2.5
                                                                py-1
                                                                text-[11px]
                                                                font-semibold
                                                                text-[#3F6337]
                                                            `
                                                            : `
                                                                shrink-0
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
                                                    {service.active
                                                        ? "Ativo"
                                                        : "Inativo"}
                                                </span>
                                            </div>

                                            {/* PREÇO + AÇÕES */}
                                            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                                <div className="shrink-0">
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
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
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