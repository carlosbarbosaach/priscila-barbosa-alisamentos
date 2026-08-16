"use client";

import {
    RefreshCw,
    Scissors,
} from "lucide-react";

import { Button } from "@/components/ui/button";



import { CreateServiceDialog } from "./CreateServiceDialog";
import { EditServiceDialog } from "./EditServiceDialog";
import { useServices } from "../../auth/hooks/useServices";
import { ServiceStatusButton } from "../../auth/components/ServiceStatusButton";

function formatPrice(
    priceInCents: number,
) {
    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
        },
    ).format(priceInCents / 100);
}

export function ServicesPageContent() {
    const {
        data: services = [],
        isLoading,
        isError,
        refetch,
    } = useServices();

    return (
        <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8 xl:px-10">
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

            <section className="mt-8">
                {isLoading && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-[200px] animate-pulse rounded-2xl border bg-white"
                            />
                        ))}
                    </div>
                )}

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

                {!isLoading &&
                    !isError &&
                    services.length === 0 && (
                        <div className="rounded-2xl border bg-white p-8 text-center">
                            <Scissors className="mx-auto size-8 text-muted-foreground" />

                            <h2 className="mt-4 font-semibold">
                                Nenhum serviço cadastrado
                            </h2>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Clique em &quot;Novo
                                serviço&quot; para fazer o
                                primeiro cadastro.
                            </p>
                        </div>
                    )}

                {!isLoading &&
                    !isError &&
                    services.length > 0 && (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {services.map(
                                (service) => (
                                    <article
                                        key={service.id}
                                        className="rounded-2xl border bg-white p-6 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                    Serviço
                                                </p>

                                                <h2 className="mt-2 text-xl font-semibold">
                                                    {service.name}
                                                </h2>
                                            </div>

                                            <span
                                                className={
                                                    service.active
                                                        ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800"
                                                        : "rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600"
                                                }
                                            >
                                                {service.active
                                                    ? "Ativo"
                                                    : "Inativo"}
                                            </span>
                                        </div>

                                        <div className="mt-6 border-t pt-5">
                                            <p className="text-sm text-muted-foreground">
                                                Preço padrão
                                            </p>

                                            <p className="mt-1 text-2xl font-semibold text-[#304229]">
                                                {formatPrice(
                                                    service.defaultPriceCents,
                                                )}
                                            </p>
                                        </div>

                                        <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t pt-4">
                                            <EditServiceDialog
                                                service={service}
                                            />

                                            <ServiceStatusButton
                                                service={service}
                                            />
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                    )}
            </section>
        </main>
    );
}