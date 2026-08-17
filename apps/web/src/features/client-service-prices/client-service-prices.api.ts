import type {
    ClientServicePrice,
} from "@priscila/shared";

import { apiFetch } from "@/services/api/api-client";

type ListClientServicePricesResponse = {
    prices: ClientServicePrice[];
};

type ClientServicePriceResponse = {
    price: ClientServicePrice;
};

export type SaveClientServicePriceInput = {
    priceCents: number;
};

export async function getAllClientServicePrices(): Promise<
    ClientServicePrice[]
> {
    const response =
        await apiFetch<ListClientServicePricesResponse>(
            "/admin/clients/service-prices",
        );

    return response.prices;
}

export async function getClientServicePrices(
    clientId: string,
): Promise<ClientServicePrice[]> {
    const response =
        await apiFetch<ListClientServicePricesResponse>(
            `/admin/clients/${clientId}/service-prices`,
        );

    return response.prices;
}

export async function saveClientServicePrice(
    clientId: string,
    serviceId: string,
    input: SaveClientServicePriceInput,
): Promise<ClientServicePrice> {
    const response =
        await apiFetch<ClientServicePriceResponse>(
            `/admin/clients/${clientId}/service-prices/${serviceId}`,
            {
                method: "PUT",
                body: JSON.stringify(input),
            },
        );

    return response.price;
}

export async function updateClientServicePriceStatus(
    clientId: string,
    serviceId: string,
    active: boolean,
): Promise<ClientServicePrice> {
    const response =
        await apiFetch<ClientServicePriceResponse>(
            `/admin/clients/${clientId}/service-prices/${serviceId}/status`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    active,
                }),
            },
        );

    return response.price;
}