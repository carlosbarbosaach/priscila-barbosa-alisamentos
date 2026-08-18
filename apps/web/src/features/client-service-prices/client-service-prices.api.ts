import type {
    ClientServicePrice,
} from "@priscila/shared";

import {
    apiFetch,
} from "@/services/api/api-client";

type ListClientServicePricesResponse = {
    prices: ClientServicePrice[];
};

type ClientServicePriceResponse = {
    price: ClientServicePrice;
};

export type SaveClientServicePriceInput = {
    priceCents: number;
};

/*
 * ========================================
 * VISÃO GERAL DOS PREÇOS ESPECIAIS
 * ========================================
 *
 * Utilizado pela página:
 *
 * /admin/precos-especiais
 */

export type SpecialPriceOverviewItem = {
    id: string;

    clientId: string;
    clientName: string;
    clientPhone: string;

    serviceId: string;
    serviceName: string;

    defaultPriceCents: number;
    specialPriceCents: number;
    differenceCents: number;
};

export type SpecialPriceOverviewSummary = {
    clientsWithSpecialPrice: number;

    activeSpecialPrices: number;

    servicesWithSpecialPrice: number;
};

export type SpecialPriceOverview = {
    summary:
        SpecialPriceOverviewSummary;

    prices:
        SpecialPriceOverviewItem[];
};

/*
 * Busca os dados já preparados
 * pelo backend para a página
 * de preços especiais.
 */
export async function getSpecialPriceOverview():
    Promise<SpecialPriceOverview> {
    return apiFetch<SpecialPriceOverview>(
        "/admin/clients/service-prices/overview",
    );
}

/*
 * ========================================
 * LISTAR TODOS OS PREÇOS ESPECIAIS
 * ========================================
 */

export async function getAllClientServicePrices(): Promise<
    ClientServicePrice[]
> {
    const response =
        await apiFetch<ListClientServicePricesResponse>(
            "/admin/clients/service-prices",
        );

    return response.prices;
}

/*
 * ========================================
 * PREÇOS DE UMA CLIENTE
 * ========================================
 */

export async function getClientServicePrices(
    clientId: string,
): Promise<ClientServicePrice[]> {
    const response =
        await apiFetch<ListClientServicePricesResponse>(
            `/admin/clients/${clientId}/service-prices`,
        );

    return response.prices;
}

/*
 * ========================================
 * CRIAR / ATUALIZAR PREÇO ESPECIAL
 * ========================================
 */

export async function saveClientServicePrice(
    clientId: string,
    serviceId: string,
    input: SaveClientServicePriceInput,
): Promise<ClientServicePrice> {
    const response =
        await apiFetch<ClientServicePriceResponse>(
            `/admin/clients/${clientId}/service-prices/${serviceId}`,
            {
                method:
                    "PUT",

                body:
                    JSON.stringify(
                        input,
                    ),
            },
        );

    return response.price;
}

/*
 * ========================================
 * ATIVAR / DESATIVAR PREÇO ESPECIAL
 * ========================================
 */

export async function updateClientServicePriceStatus(
    clientId: string,
    serviceId: string,
    active: boolean,
): Promise<ClientServicePrice> {
    const response =
        await apiFetch<ClientServicePriceResponse>(
            `/admin/clients/${clientId}/service-prices/${serviceId}/status`,
            {
                method:
                    "PATCH",

                body:
                    JSON.stringify({
                        active,
                    }),
            },
        );

    return response.price;
}