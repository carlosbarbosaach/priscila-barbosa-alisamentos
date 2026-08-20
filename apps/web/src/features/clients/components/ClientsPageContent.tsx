"use client";

import {
    RefreshCw,
    Search,
    X,
} from "lucide-react";

import {
    useMemo,
    useState,
} from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAllClientServicePrices } from "@/features/client-service-prices/hooks/useAllClientServicePrices";
import { useClients } from "@/features/clients/hooks/useClients";
import { useServices } from "@/features/services/hooks/useServices";

import { ClientsDesktopTable } from "./ClientsDesktopTable";
import { ClientsMobileCards } from "./ClientsMobileCards";
import { CreateClientDialog } from "./CreateClientDialog";

type StatusFilter =
    | "ALL"
    | "ACTIVE"
    | "INACTIVE";

type PriceFilter =
    | "ALL"
    | "SPECIAL"
    | "NO_SPECIAL";

type SortOption =
    | "NAME_ASC"
    | "NAME_DESC";

function normalizeSearchValue(
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

export function ClientsPageContent() {
    const [search, setSearch] =
        useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] =
        useState<StatusFilter>(
            "ALL",
        );

    const [
        priceFilter,
        setPriceFilter,
    ] =
        useState<PriceFilter>(
            "ALL",
        );

    const [sort, setSort] =
        useState<SortOption>(
            "NAME_ASC",
        );

    const {
        data: clients = [],
        isLoading:
        isLoadingClients,
        isError:
        isClientsError,
        refetch:
        refetchClients,
    } = useClients();

    const {
        data: specialPrices = [],
        isLoading:
        isLoadingSpecialPrices,
        isError:
        isSpecialPricesError,
        refetch:
        refetchSpecialPrices,
    } =
        useAllClientServicePrices();

    const {
        data: services = [],
        isLoading:
        isLoadingServices,
        isError:
        isServicesError,
        refetch:
        refetchServices,
    } = useServices();

    const activeSpecialPrices =
        useMemo(
            () =>
                specialPrices.filter(
                    (price) =>
                        price.active,
                ),
            [specialPrices],
        );

    const clientsWithSpecialPrice =
        useMemo(
            () =>
                new Set(
                    activeSpecialPrices.map(
                        (price) =>
                            price.clientId,
                    ),
                ),
            [activeSpecialPrices],
        );

    const filteredClients =
        useMemo(() => {
            const normalizedSearch =
                normalizeSearchValue(
                    search,
                );

            const searchDigits =
                search.replace(
                    /\D/g,
                    "",
                );

            const filtered =
                clients.filter(
                    (client) => {
                        const hasSpecialPrice =
                            clientsWithSpecialPrice.has(
                                client.id,
                            );

                        if (
                            statusFilter ===
                            "ACTIVE" &&
                            !client.active
                        ) {
                            return false;
                        }

                        if (
                            statusFilter ===
                            "INACTIVE" &&
                            client.active
                        ) {
                            return false;
                        }

                        if (
                            priceFilter ===
                            "SPECIAL" &&
                            !hasSpecialPrice
                        ) {
                            return false;
                        }

                        if (
                            priceFilter ===
                            "NO_SPECIAL" &&
                            hasSpecialPrice
                        ) {
                            return false;
                        }

                        if (
                            !normalizedSearch &&
                            !searchDigits
                        ) {
                            return true;
                        }

                        const name =
                            normalizeSearchValue(
                                client.name,
                            );

                        const email =
                            normalizeSearchValue(
                                client.email ??
                                "",
                            );

                        const phone =
                            client.phone.replace(
                                /\D/g,
                                "",
                            );

                        const matchesText =
                            name.includes(
                                normalizedSearch,
                            ) ||
                            email.includes(
                                normalizedSearch,
                            );

                        const matchesPhone =
                            searchDigits.length >
                            0 &&
                            phone.includes(
                                searchDigits,
                            );

                        return (
                            matchesText ||
                            matchesPhone
                        );
                    },
                );

            return [...filtered].sort(
                (a, b) => {
                    const comparison =
                        a.name.localeCompare(
                            b.name,
                            "pt-BR",
                            {
                                sensitivity:
                                    "base",
                            },
                        );

                    return sort ===
                        "NAME_ASC"
                        ? comparison
                        : -comparison;
                },
            );
        }, [
            clients,
            clientsWithSpecialPrice,
            priceFilter,
            search,
            sort,
            statusFilter,
        ]);

    const hasActiveFilters =
        search.length > 0 ||
        statusFilter !== "ALL" ||
        priceFilter !== "ALL" ||
        sort !== "NAME_ASC";

    function clearFilters() {
        setSearch("");
        setStatusFilter("ALL");
        setPriceFilter("ALL");
        setSort("NAME_ASC");
    }

    const pageIsLoading =
        isLoadingClients ||
        isLoadingSpecialPrices ||
        isLoadingServices;

    const pageHasError =
        isClientsError ||
        isSpecialPricesError ||
        isServicesError;

    return (
        <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8 xl:px-10">
            <AdminPageHeader
                eyebrow="Administração"
                title="Clientes"
                description="Gerencie as clientes do salão, seus contatos e seus preços personalizados."
                rightContent={
                    <CreateClientDialog />
                }
            />

            <section className="mt-8 rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        type="search"
                        value={search}
                        placeholder="Buscar por nome, telefone ou e-mail..."
                        className="pl-10"
                        onChange={(event) =>
                            setSearch(
                                event.target.value,
                            )
                        }
                    />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Status
                        </label>

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target
                                        .value as StatusFilter,
                                )
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                        >
                            <option value="ALL">
                                Todas
                            </option>

                            <option value="ACTIVE">
                                Ativas
                            </option>

                            <option value="INACTIVE">
                                Inativas
                            </option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Preço
                        </label>

                        <select
                            value={
                                priceFilter
                            }
                            onChange={(event) =>
                                setPriceFilter(
                                    event.target
                                        .value as PriceFilter,
                                )
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                        >
                            <option value="ALL">
                                Todos
                            </option>

                            <option value="SPECIAL">
                                Com preço especial
                            </option>

                            <option value="NO_SPECIAL">
                                Sem preço especial
                            </option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Ordenar
                        </label>

                        <select
                            value={sort}
                            onChange={(event) =>
                                setSort(
                                    event.target
                                        .value as SortOption,
                                )
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                        >
                            <option value="NAME_ASC">
                                Nome A-Z
                            </option>

                            <option value="NAME_DESC">
                                Nome Z-A
                            </option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        <strong className="font-semibold text-foreground">
                            {
                                filteredClients.length
                            }
                        </strong>{" "}
                        {filteredClients.length ===
                            1
                            ? "cliente encontrada"
                            : "clientes encontradas"}
                    </p>

                    {hasActiveFilters && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={
                                clearFilters
                            }
                        >
                            <X className="mr-2 size-4" />
                            Limpar filtros
                        </Button>
                    )}
                </div>
            </section>

            <section className="mt-6">
                {pageIsLoading && (
                    <div className="rounded-2xl border bg-white p-8">
                        <p className="text-sm text-muted-foreground">
                            Carregando clientes...
                        </p>
                    </div>
                )}

                {pageHasError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                        <p className="text-sm font-medium text-red-700">
                            Não foi possível carregar
                            os dados das clientes.
                        </p>

                        <Button
                            type="button"
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                                void refetchClients();
                                void refetchSpecialPrices();
                                void refetchServices();
                            }}
                        >
                            <RefreshCw className="mr-2 size-4" />
                            Tentar novamente
                        </Button>
                    </div>
                )}

                {!pageIsLoading &&
                    !pageHasError &&
                    filteredClients.length ===
                    0 && (
                        <div className="rounded-2xl border bg-white p-8 text-center">
                            <Search className="mx-auto size-8 text-muted-foreground" />

                            <h2 className="mt-4 font-semibold">
                                Nenhuma cliente
                                encontrada
                            </h2>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Tente alterar os
                                filtros ou o termo de
                                busca.
                            </p>
                        </div>
                    )}

                {!pageIsLoading &&
                    !pageHasError &&
                    filteredClients.length >
                    0 && (
                        <>
                            <ClientsDesktopTable
                                clients={
                                    filteredClients
                                }
                                specialPrices={
                                    activeSpecialPrices
                                }
                                services={
                                    services
                                }
                            />

                            <ClientsMobileCards
                                clients={
                                    filteredClients
                                }
                                specialPrices={
                                    activeSpecialPrices
                                }
                                services={
                                    services
                                }
                            />
                        </>
                    )}
            </section>
        </main>
    );
}